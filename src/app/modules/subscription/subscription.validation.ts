import z from "zod";


const createSubscription = z.object({
    planId: z.string({
        required_error: "SubscriptionId is required!"
    }),
    paymentMethodId: z.string({
        required_error: "paymentMethodId is required!"
    }),
});
const upgradeSubscription = z.object({
    newPlanId: z.string({
        required_error: "newPlanId is required!"
    }),
});

export const SubscriptionValidation = {
    createSubscription,
    upgradeSubscription
}