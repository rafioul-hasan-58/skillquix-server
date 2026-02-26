
import status from "http-status";
import prisma from "../../lib/prisma";
import ApiError from "../../errors/ApiError";
import stripe from "../../stripe/stripe";
import Stripe from "stripe";
import QueryBuilder from "../../builder/QueryBuilder";
import { SubscriptionStatus, SubscriptionType } from "@prisma/client";
import { PlanService } from "../plan/plan.service";
import { monthlyRevenue } from "./subscription.helper";

const createSubscription = async (
  userId: string,
  planId: string,
  paymentMethodId: string
) => {
  // Step 1 — Get user and plan from DB
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError(status.NOT_FOUND, "User not found");
  if (!user.stripeCustomerId) throw new ApiError(status.BAD_REQUEST, "Stripe customer not found");

  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan) throw new ApiError(status.NOT_FOUND, "Plan not found");
  if (!plan.isActive || plan.isDeleted) throw new ApiError(status.BAD_REQUEST, "Plan is not available");
  if (!plan.stripePriceId) throw new ApiError(status.BAD_REQUEST, "Plan has no price configured");

  // Step 2 — Attach payment method to Stripe customer
  await stripe.paymentMethods.attach(paymentMethodId, {
    customer: user.stripeCustomerId,
  });

  // Step 3 — Set as default payment method
  await stripe.customers.update(user.stripeCustomerId, {
    invoice_settings: { default_payment_method: paymentMethodId },
  });

  // Step 4 — Create the Subscription in Stripe
  const subscription = await stripe.subscriptions.create({
    customer: user.stripeCustomerId,
    items: [{ price: plan.stripePriceId }],
    payment_behavior: "default_incomplete",
    payment_settings: { save_default_payment_method: "on_subscription" },
    expand: ["latest_invoice.payment_intent"],
  });

  // Step 5 — Extract clientSecret to send to frontend
  const invoice = subscription.latest_invoice as Stripe.Invoice;
  const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;
  const fullClientSecret = paymentIntent.client_secret;
  if (!fullClientSecret) throw new ApiError(status.BAD_REQUEST, "Client secret not found");
  const clientSecret = fullClientSecret.split("_secret_")[0];

  return {
    subscriptionId: subscription.id,
    clientSecret,
  };
};

const cancelSubscription = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError(status.NOT_FOUND, "User not found");

  if (!user.stripeSubscriptionId) {
    throw new ApiError(status.BAD_REQUEST, "No active subscription found");
  }

  if (user.subscriptionStatus === "CANCELED") {
    throw new ApiError(status.BAD_REQUEST, "Subscription is already canceled");
  }

  // Cancel at period end — user keeps access until currentPeriodEnd
  await stripe.subscriptions.update(user.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });

  // Update DB — mark as canceled but keep subscriptionType until webhook fires
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { subscriptionStatus: "CANCELED" },
  });

  return {
    message: "Subscription canceled successfully. You will have access until your current period ends.",
    currentPeriodEnd: updatedUser.currentPeriodEnd,
  };
};

const getSubscribedUsers = async (query: Record<string, unknown>) => {
  const userQuery = new QueryBuilder(prisma.user, query)
    .search(["fullName"])
    .filter()
    .paginate()
    .rawFilter({ subscriptionStatus: SubscriptionStatus.ACTIVE })
    .select({
      id: true,
      fullName: true,
      email: true,
      profileImage: true,
      subscriptionType: true,
      subscriptionStatus: true,
      currentPeriodEnd: true,
    });

  const [result, meta] = await Promise.all([
    userQuery.execute(),
    userQuery.countTotal(),
  ]);

  if (!result.length) throw new ApiError(status.NOT_FOUND, "No users found!");

  // Get all unique plan types from results
  const planTypes = [...new Set(result.map((u: any) => u.subscriptionType))] as SubscriptionType[];

  // Fetch matching plans in one query
  const plans = await prisma.plan.findMany({
    where: { type: { in: planTypes } },
    select: { type: true, name: true, monthlyPrice: true },
  });

  // Map plan info to each user
  const data = result.map((user: any) => ({
    ...user,
    plan: plans.find((p) => p.type === user.subscriptionType) ?? null,
  }));

  return { meta, data };
};

const getSubscriptions = async (query: Record<string, unknown>) => {
  const subscribedUsers = await getSubscribedUsers(query);



  const plans = await PlanService.getAllPlans();
  const totalRevenue = await monthlyRevenue();

  return {
    totalRevenue,
    activeSubscriptions: subscribedUsers.meta?.total ?? subscribedUsers.data?.length ?? 0,
    plans,
    subscribedUsers
  };
};
const upgradeSubscription = async (userId: string, newPlanId: string) => {
  // Step 1 — Get user
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError(status.NOT_FOUND, "User not found");
  if (!user.stripeSubscriptionId) throw new ApiError(status.BAD_REQUEST, "No active subscription found");
  if (user.subscriptionStatus !== "ACTIVE") throw new ApiError(status.BAD_REQUEST, "Subscription is not active");

  // Step 2 — Get new plan
  const newPlan = await prisma.plan.findUnique({ where: { id: newPlanId } });
  if (!newPlan) throw new ApiError(status.NOT_FOUND, "Plan not found");
  if (!newPlan.isActive || newPlan.isDeleted) throw new ApiError(status.BAD_REQUEST, "Plan is not available");
  if (!newPlan.stripePriceId) throw new ApiError(status.BAD_REQUEST, "Plan has no price configured");

  // Step 3 — Prevent upgrading to same or lower plan
  const planHierarchy = { FREE: 0, PRO: 1, PREMIUM: 2 };
  const currentPlanLevel = planHierarchy[user.subscriptionType];
  const newPlanLevel = planHierarchy[newPlan.type];

  if (newPlanLevel <= currentPlanLevel) {
    throw new ApiError(status.BAD_REQUEST, "New plan must be higher than current plan");
  }

  // Step 4 — Get current subscription from Stripe
  const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);

  // Step 5 — Upgrade immediately with proration
  const updatedSubscription = await stripe.subscriptions.update(
    user.stripeSubscriptionId,
    {
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPlan.stripePriceId,
        },
      ],
      proration_behavior: "create_prorations", // charge difference immediately
    }
  );

  // Step 6 — Update DB immediately (webhook will also update but this is faster)
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionType: newPlan.type,
      currentPeriodEnd: new Date(updatedSubscription.current_period_end * 1000),
    },
  });

  return {
    message: "Subscription upgraded successfully",
    newPlan: newPlan.name,
    currentPeriodEnd: new Date(updatedSubscription.current_period_end * 1000),
  };
};

export const SubscriptionService = {
  createSubscription,
  getSubscribedUsers,
  getSubscriptions,
  cancelSubscription,
  upgradeSubscription
}