
import status from "http-status";
import prisma from "../../lib/prisma";
import ApiError from "../../errors/ApiError";
import stripe from "../../stripe/stripe";
import Stripe from "stripe";

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

export const SubscriptionService = {
    createSubscription
}