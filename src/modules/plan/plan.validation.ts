import { SubscriptionType } from "@prisma/client";
import { z } from "zod";

const createPlanSchema = z.object({
    name: z
        .string()
        .min(3, "Name must be at least 3 characters")
        .max(100, "Name must be less than 100 characters"),

    description: z
        .string()
        .min(10, "Description must be at least 10 characters")
        .max(500, "Description must be less than 500 characters"),

    monthlyPrice: z
        .number({
            required_error: "Monthly price is required",
            invalid_type_error: "Monthly price must be a number",
        }),
    type: z.nativeEnum(SubscriptionType, {
        required_error: "Type is required",
        invalid_type_error: "Type must be FREE, PRO, or ENTERPRISE",
    }),

    features: z
        .array(
            z
                .string()
                .min(3, "Feature must be at least 3 characters")
                .max(200, "Feature must be less than 200 characters")
        )
        .min(1, "At least one feature is required")
        .max(50, "Too many features"),
});

const updatePlanSchema = createPlanSchema.partial()

export const PlanValidation = {
    createPlanSchema,
    updatePlanSchema,
};