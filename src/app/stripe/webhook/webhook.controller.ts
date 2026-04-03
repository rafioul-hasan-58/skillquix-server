import { Request, Response } from "express";

import Stripe from "stripe";
import stripe from "../stripe";
import prisma from "../../lib/prisma";
import config from "../../../config";
import { InvoiceStatus, SubscriptionStatus, SubscriptionType } from "@prisma/client";

const handleStripeWebhook = async (req: Request, res: Response) => {

    const sig = req.headers["stripe-signature"] as string;

    let event: Stripe.Event;

    // Step 1 — Verify the webhook is actually from Stripe
    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            config.stripe.webhook_secret as string
        );
    } catch (err) {
        console.error("Webhook signature verification failed:", err);
        return res.status(400).send("Webhook signature verification failed");
    }

    console.log("Webhook received!", event.type)

    // Step 2 — Handle each event type
    try {
        switch (event.type) {

            // Payment succeeded — activate user
            case "invoice.paid": {
                const invoice = event.data.object as Stripe.Invoice;
                const subscriptionId = invoice.subscription as string;
                const customerId = invoice.customer as string;

                const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                console.log("subscription",subscription)
                const plan = await prisma.plan.findFirst({
                    where: { stripePriceId: subscription.items.data[0].price.id },
                });

                // ✅ Fetch user ONCE and reuse
                const user = await prisma.user.findUnique({ where: { stripeCustomerId: customerId } });
                if (!user) break;

                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        subscriptionStatus: SubscriptionStatus.ACTIVE,
                        subscriptionType: plan?.type ?? SubscriptionType.PRO,
                        stripeSubscriptionId: subscriptionId,
                        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                    },
                });

                await prisma.invoice.create({
                    data: {
                        stripeInvoiceId: invoice.id,
                        userId: user.id, // ✅ reuse
                        amount: invoice.amount_paid / 100,
                        currency: invoice.currency,
                        status: InvoiceStatus.PAID,
                        planName: plan?.name ?? "Unknown",
                        billingPeriodStart: new Date(invoice.period_start * 1000),
                        billingPeriodEnd: new Date(invoice.period_end * 1000),
                        invoiceUrl: invoice.hosted_invoice_url ?? null,
                    },
                });
                break;
            }

            // Payment failed — restrict access
            case "invoice.payment_failed": {
                const invoice = event.data.object as Stripe.Invoice;
                const customerId = invoice.customer as string;

                const user = await prisma.user.findUnique({
                    where: { stripeCustomerId: customerId },
                });
                if (!user) break;

                // Update user status
                await prisma.user.update({
                    where: { stripeCustomerId: customerId },
                    data: { subscriptionStatus: "PAST_DUE" },
                });

                // Create failed Invoice record
                await prisma.invoice.create({
                    data: {
                        stripeInvoiceId: invoice.id,
                        userId: user.id,
                        amount: invoice.amount_due / 100,
                        currency: invoice.currency,
                        status: "FAILED",
                        planName: "Unknown",
                        billingPeriodStart: new Date(invoice.period_start * 1000),
                        billingPeriodEnd: new Date(invoice.period_end * 1000),
                    },
                });
                break;
            }

            // Subscription canceled
            case "customer.subscription.deleted": {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;

                await prisma.user.update({
                    where: { stripeCustomerId: customerId },
                    data: {
                        subscriptionStatus: "CANCELED",
                        subscriptionType: "FREE",
                        stripeSubscriptionId: null,
                        currentPeriodEnd: null,
                    },
                });
                break;
            }

            // Subscription updated(upgrade / downgrade)
            case "customer.subscription.updated": {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;

                const plan = await prisma.plan.findFirst({
                    where: { stripePriceId: subscription.items.data[0].price.id },
                });

                await prisma.user.update({
                    where: { stripeCustomerId: customerId },
                    data: {
                        subscriptionType: plan?.type ?? "PRO",
                        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                    },
                });
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        // Always return 200 to Stripe so it knows you received the event
        res.status(200).json({ received: true });

    } catch (err) {
        console.error("Webhook handler error:", err);
        res.status(500).json({ error: "Webhook handler failed" });
    }
};

export const WebhookController = { handleStripeWebhook };