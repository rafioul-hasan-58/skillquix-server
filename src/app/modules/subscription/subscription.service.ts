
import status from "http-status";
import prisma from "../../lib/prisma";
import ApiError from "../../errors/ApiError";
import stripe from "../../stripe/stripe";
import Stripe from "stripe";
import QueryBuilder from "../../builder/QueryBuilder";
import { SubscriptionStatus, SubscriptionType } from "@prisma/client";
import { PlanService } from "../plan/plan.service";

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

  return {
    subscriptionId: subscription.id,
    clientSecret: paymentIntent.client_secret,
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

  // 1️⃣ Get current month range
  const now = new Date();

  const startOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  );

  const startOfNextMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    1
  );

  // 2️⃣ Aggregate revenue
  const monthlyRevenue = await prisma.invoice.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      status: "PAID", // or InvoiceStatus.PAID
      createdAt: {
        gte: startOfMonth,
        lt: startOfNextMonth,
      },
    },
  });

  const plans = await PlanService.getAllPlans();

  return {
    totalRevenue: monthlyRevenue._sum.amount ?? 0,
    activeSubscriptions: subscribedUsers.meta?.total ?? subscribedUsers.data?.length ?? 0,
    plans,
    subscribedUsers
  };
};
export const SubscriptionService = {
  createSubscription,
  getSubscribedUsers,
  getSubscriptions
}