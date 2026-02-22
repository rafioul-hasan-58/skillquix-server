import z from "zod";


const createSubscription = z.object({
    planId: z.string({
        required_error: "SubscriptionId is required!"
    }),
    paymentMethodId: z.string({
        required_error: "paymentMethodId is required!"
    }),
});

export const SubscriptionValidation = {
    createSubscription
}