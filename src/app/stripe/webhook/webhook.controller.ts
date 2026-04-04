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
        console.error("❌ Webhook signature verification failed:", err);
        return res.status(400).send("Webhook signature verification failed");
    }
    const stripeStatusMap: Record<string, SubscriptionStatus> = {
        active: SubscriptionStatus.ACTIVE,
        past_due: SubscriptionStatus.PAST_DUE,
        canceled: SubscriptionStatus.CANCELED,
        incomplete: SubscriptionStatus.INACTIVE,
        incomplete_expired: SubscriptionStatus.INACTIVE,
        trialing: SubscriptionStatus.ACTIVE,
        unpaid: SubscriptionStatus.INACTIVE,
    };
    console.log("📩 Webhook received:", event.type);

    // Step 2 — Handle each event type
    try {

        // switch (event.type) {

        //     // Payment succeeded — activate user
        //     // case "invoice.paid": {
        //     //     const invoice = event.data.object as Stripe.Invoice;
        //     //     const subscriptionId = invoice.subscription as string;
        //     //     const customerId = invoice.customer as string;

        //     //     const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        //     //     const plan = await prisma.plan.findFirst({
        //     //         where: { stripePriceId: subscription.items.data[0].price.id },
        //     //     });

        //     //     //  Fetch user ONCE and reuse
        //     //     const user = await prisma.user.findUnique({ where: { stripeCustomerId: customerId } });
        //     //     if (!user) break;
        //     //     //  Calculate currentPeriodEnd as one month from now
        //     //     const currentDate = new Date();
        //     //     const currentPeriodEnd = new Date(currentDate);
        //     //     currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
        //     //     await prisma.user.update({
        //     //         where: { id: user.id },
        //     //         data: {
        //     //             subscriptionStatus: SubscriptionStatus.ACTIVE,
        //     //             subscriptionType: plan?.type ?? SubscriptionType.PRO,
        //     //             stripeSubscriptionId: subscriptionId,
        //     //             currentPeriodEnd
        //     //         },
        //     //     });

        //     //     await prisma.invoice.create({
        //     //         data: {
        //     //             stripeInvoiceId: invoice.id,
        //     //             userId: user.id,
        //     //             amount: invoice.amount_paid / 100,
        //     //             currency: invoice.currency,
        //     //             status: InvoiceStatus.PAID,
        //     //             planName: plan?.name ?? "Unknown",
        //     //             billingPeriodStart: new Date(invoice.period_start * 1000),
        //     //             billingPeriodEnd: new Date(invoice.period_end * 1000),
        //     //             invoiceUrl: invoice.hosted_invoice_url ?? null,
        //     //         },
        //     //     });
        //     //     break;
        //     // }
        //     case "invoice.paid": {
        //         const invoice = event.data.object as Stripe.Invoice;
        //         const subscriptionId = invoice.subscription as string;
        //         const customerId = invoice.customer as string;

        //         // 🔍 DEBUG LOGS
        //         console.log("customerId from Stripe:", customerId);
        //         console.log("subscriptionId from Stripe:", subscriptionId);

        //         // Check what's actually in your DB
        //         const allUsers = await prisma.user.findMany({
        //             select: { id: true, email: true, stripeCustomerId: true }
        //         });
        //         console.log("All users with stripeCustomerId:", allUsers);

        //         const user = await prisma.user.findUnique({
        //             where: { stripeCustomerId: customerId }
        //         });
        //         console.log("Found user:", user);

        //         if (!user) {
        //             console.log("❌ No user found with stripeCustomerId:", customerId);
        //             break;
        //         }
        //         // ...
        //     }
        //     // Payment failed — restrict access
        //     case "invoice.payment_failed": {
        //         const invoice = event.data.object as Stripe.Invoice;
        //         const customerId = invoice.customer as string;

        //         const user = await prisma.user.findUnique({
        //             where: { stripeCustomerId: customerId },
        //         });
        //         if (!user) break;

        //         // Update user status
        //         await prisma.user.update({
        //             where: { stripeCustomerId: customerId },
        //             data: { subscriptionStatus: "PAST_DUE" },
        //         });

        //         // Create failed Invoice record
        //         await prisma.invoice.create({
        //             data: {
        //                 stripeInvoiceId: invoice.id,
        //                 userId: user.id,
        //                 amount: invoice.amount_due / 100,
        //                 currency: invoice.currency,
        //                 status: "FAILED",
        //                 planName: "Unknown",
        //                 billingPeriodStart: new Date(invoice.period_start * 1000),
        //                 billingPeriodEnd: new Date(invoice.period_end * 1000),
        //             },
        //         });
        //         break;
        //     }

        //     // Subscription canceled
        //     case "customer.subscription.deleted": {
        //         const subscription = event.data.object as Stripe.Subscription;
        //         const customerId = subscription.customer as string;

        //         await prisma.user.update({
        //             where: { stripeCustomerId: customerId },
        //             data: {
        //                 subscriptionStatus: "CANCELED",
        //                 subscriptionType: "FREE",
        //                 stripeSubscriptionId: null,
        //                 currentPeriodEnd: null,
        //             },
        //         });
        //         break;
        //     }

        //     // Subscription updated(upgrade / downgrade)
        // case "customer.subscription.updated": {
        //     const subscription = event.data.object as Stripe.Subscription;
        //     const customerId = subscription.customer as string;

        //     const plan = await prisma.plan.findFirst({
        //         where: { stripePriceId: subscription.items.data[0].price.id },
        //     });
        //     //  Calculate currentPeriodEnd as one month from now
        // const currentDate = new Date();
        // const currentPeriodEnd = new Date(currentDate);
        // currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
        //     await prisma.user.update({
        //         where: { stripeCustomerId: customerId },
        //         data: {
        //             subscriptionType: plan?.type ?? "PRO",
        //             currentPeriodEnd
        //         },
        //     });
        //     break;
        // }

        //     default:
        //         console.log(`Unhandled event type: ${event.type}`);
        // }

        // Always return 200 to Stripe so it knows you received the event
        switch (event.type) {

            case "customer.subscription.created":
            case "customer.subscription.updated": {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;

                // Find user by stripeCustomerId
                let user = await prisma.user.findUnique({
                    where: { stripeCustomerId: customerId }
                });

                // Fallback — look up by email if stripeCustomerId not saved yet
                if (!user) {
                    const stripeCustomer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
                    if (stripeCustomer.email) {
                        user = await prisma.user.findUnique({
                            where: { email: stripeCustomer.email }
                        });
                        if (user) {
                            await prisma.user.update({
                                where: { id: user.id },
                                data: { stripeCustomerId: customerId }
                            });
                        }
                    }
                }

                if (!user) {
                    console.error("❌ No user found for customerId:", customerId);
                    break;
                }

                // Find plan by Stripe price ID
                const plan = await prisma.plan.findFirst({
                    where: { stripePriceId: subscription.items.data[0].price.id },
                });

                if (!plan) {
                    console.error("❌ No plan found for priceId:", subscription.items.data[0].price.id);
                    break;
                }
                const currentDate = new Date();
                const currentPeriodEnd = new Date(currentDate);
                currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

                // Map Stripe status — respect cancel_at_period_end
                const newStatus = subscription.cancel_at_period_end
                    ? SubscriptionStatus.CANCELED
                    : (stripeStatusMap[subscription.status] ?? SubscriptionStatus.INACTIVE);
                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        subscriptionStatus: newStatus,
                        subscriptionType: plan.type,
                        stripeSubscriptionId: subscription.id,
                        currentPeriodEnd,
                    },
                });

                console.log(`✅ ${event.type} | user: ${user.email} | plan: ${plan.type} | status: ${newStatus}`);
                break;
            }


            // case "invoice.paid": {
            //     const invoice = event.data.object as Stripe.Invoice;
            //     const customerId = invoice.customer as string;

            //     //  subscriptionId can be undefined on first invoice — get it safely
            //     const subscriptionId = typeof invoice.subscription === "string"
            //         ? invoice.subscription
            //         : (invoice.subscription as any)?.id ?? null;

            //     console.log("customerId from Stripe:", customerId);
            //     console.log("subscriptionId from Stripe:", subscriptionId);

            //     //  Find user
            //     let user = await prisma.user.findUnique({ where: { stripeCustomerId: customerId } });

            //     if (!user) {
            //         const stripeCustomer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
            //         if (stripeCustomer.email) {
            //             user = await prisma.user.findUnique({ where: { email: stripeCustomer.email } });
            //             if (user) {
            //                 await prisma.user.update({
            //                     where: { id: user.id },
            //                     data: { stripeCustomerId: customerId }
            //                 });
            //             }
            //         }
            //     }

            //     if (!user) {
            //         console.log("❌ No user found for customerId:", customerId);
            //         break;
            //     }

            //     // Get plan — either from subscription or fallback
            //     let plan = null;
            //     let currentPeriodEnd = new Date();
            //     currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1); // default: 1 month

            //     if (subscriptionId) {
            //         const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            //         plan = await prisma.plan.findFirst({
            //             where: { stripePriceId: subscription.items.data[0].price.id },
            //         });
            //     } else {
            //         // Fallback: get price from invoice line items
            //         const priceId = invoice.lines?.data?.[0]?.price?.id;
            //         if (priceId) {
            //             plan = await prisma.plan.findFirst({ where: { stripePriceId: priceId } });
            //         }
            //         console.log("⚠️ No subscriptionId on invoice, used fallback price lookup");
            //     }

            //     //  Update user subscription
            //     await prisma.user.update({
            //         where: { id: user.id },
            //         data: {
            //             subscriptionStatus: SubscriptionStatus.ACTIVE,
            //             subscriptionType: plan?.type ?? SubscriptionType.PREMIUM,
            //             ...(subscriptionId && { stripeSubscriptionId: subscriptionId }),
            //             currentPeriodEnd,
            //         },
            //     });

            //     //  Create invoice record
            //     await prisma.invoice.create({
            //         data: {
            //             stripeInvoiceId: invoice.id,
            //             userId: user.id,
            //             amount: invoice.amount_paid / 100,
            //             currency: invoice.currency,
            //             status: InvoiceStatus.PAID,
            //             planName: plan?.name ?? "Unknown",
            //             billingPeriodStart: new Date(invoice.period_start * 1000),
            //             billingPeriodEnd: new Date(invoice.period_end * 1000),
            //             invoiceUrl: invoice.hosted_invoice_url ?? null,
            //         },
            //     });

            //     console.log("✅ invoice.paid handled for user:", user.email);
            //     break;
            // }
            case "invoice.paid": {
                const invoice = event.data.object as Stripe.Invoice;
                const customerId = invoice.customer as string;

                const user = await prisma.user.findUnique({
                    where: { stripeCustomerId: customerId }
                });
                if (!user) break;

                const subscriptionId = typeof invoice.subscription === "string"
                    ? invoice.subscription : null;

                let plan = null;
                if (subscriptionId) {
                    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                    plan = await prisma.plan.findFirst({
                        where: { stripePriceId: subscription.items.data[0].price.id },
                    });
                }

                // ONLY create invoice record — no prisma.user.update here
                await prisma.invoice.create({
                    data: {
                        stripeInvoiceId: invoice.id,
                        userId: user.id,
                        amount: invoice.amount_paid / 100,
                        currency: invoice.currency,
                        status: InvoiceStatus.PAID,
                        planName: plan?.name ?? "Unknown",
                        billingPeriodStart: new Date(invoice.period_start * 1000),
                        billingPeriodEnd: new Date(invoice.period_end * 1000),
                        invoiceUrl: invoice.hosted_invoice_url ?? null,
                    },
                });

                console.log("✅ invoice.paid — invoice record created for:", user.email);
                break;
            }

            case "customer.subscription.deleted": {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;

                const user = await prisma.user.findUnique({ where: { stripeCustomerId: customerId } });
                if (!user) break;

                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        subscriptionStatus: SubscriptionStatus.INACTIVE,
                        subscriptionType: SubscriptionType.FREE,
                        stripeSubscriptionId: null,
                        currentPeriodEnd: null,
                    },
                });

                console.log("✅ Subscription cancelled for user:", user.email);
                break;
            }

            case "invoice.payment_failed": {
                const invoice = event.data.object as Stripe.Invoice;
                const customerId = invoice.customer as string;

                const user = await prisma.user.findUnique({ where: { stripeCustomerId: customerId } });
                if (!user) break;

                await prisma.user.update({
                    where: { id: user.id },
                    data: { subscriptionStatus: SubscriptionStatus.INACTIVE },
                });

                console.log("⚠️ Payment failed for user:", user.email);
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        res.status(200).json({ received: true });

    } catch (err) {
        console.error("Webhook handler error:", err);
        res.status(500).json({ error: "Webhook handler failed" });
    }
};

export const WebhookController = { handleStripeWebhook };