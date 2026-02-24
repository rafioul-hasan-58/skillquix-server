import { SubscriptionType } from "@prisma/client";
import prisma from "../../lib/prisma";
import stripe from "../../stripe/stripe";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";


const createPlan = async (payload: {
    name: string;
    description?: string;
    monthlyPrice: number;
    features: string[];
    type: SubscriptionType;
}) => {
    // Step 1 — Create Product in Stripe
    const stripeProduct = await stripe.products.create({
        name: payload.name,
        description: payload.description,
    });

    // Step 2 — Create Price in Stripe linked to that Product
    const stripePrice = await stripe.prices.create({
        product: stripeProduct.id,
        unit_amount: Math.round(payload.monthlyPrice * 100), // Stripe uses cents
        currency: "usd",
        recurring: { interval: "month" },
    });

    // Step 3 — Save Plan to DB with Stripe IDs
    const plan = await prisma.plan.create({
        data: {
            name: payload.name,
            description: payload.description,
            monthlyPrice: payload.monthlyPrice,
            features: payload.features,
            type: payload.type,
            stripeProductId: stripeProduct.id,
            stripePriceId: stripePrice.id,
        },
    });

    return plan;
};
const updatePlan = async (
    planId: string,
    payload: {
        name?: string;
        description?: string;
        monthlyPrice?: number;
        features?: string[];
        isActive?: boolean;
    }
) => {
    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) throw new ApiError(httpStatus.NOT_FOUND, "Plan not found");

    // If name or description changed — update Stripe Product
    if (payload.name || payload.description) {
        await stripe.products.update(plan.stripeProductId as string, {
            ...(payload.name && { name: payload.name }),
            ...(payload.description && { description: payload.description }),
        });
    }

    // If price changed — create a NEW Stripe Price and archive the old one
    // (Stripe doesn't allow editing existing prices)
    let newStripePriceId = plan.stripePriceId;
    if (payload.monthlyPrice && payload.monthlyPrice !== plan.monthlyPrice) {
        const newStripePrice = await stripe.prices.create({
            product: plan.stripeProductId as string,
            unit_amount: Math.round(payload.monthlyPrice * 100),
            currency: "usd",
            recurring: { interval: "month" },
        });

        // Archive old price in Stripe
        await stripe.prices.update(plan.stripePriceId as string, {
            active: false,
        });

        newStripePriceId = newStripePrice.id;
    }

    const updatedPlan = await prisma.plan.update({
        where: { id: planId },
        data: {
            ...payload,
            stripePriceId: newStripePriceId,
        },
    });

    return updatedPlan;
};
const deletePlan = async (planId: string) => {
    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) throw new ApiError(httpStatus.NOT_FOUND, "Plan not found");

    // Archive product in Stripe so it's no longer usable
    await stripe.products.update(plan.stripeProductId as string, {
        active: false,
    });

    // Soft delete in DB
    const deletedPlan = await prisma.plan.update({
        where: { id: planId },
        data: {
            isDeleted: true,
            isActive: false,
        },
    });

    return deletedPlan;
};

const getAllPlans = async () => {
    const result = await prisma.plan.findMany({
        where: {
            isActive: true,
            isDeleted: false
        }
    });
    return result
}

export const PlanService = {
    createPlan,
    updatePlan,
    deletePlan,
    getAllPlans
};