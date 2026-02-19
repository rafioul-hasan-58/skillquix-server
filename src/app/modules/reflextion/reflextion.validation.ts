import { optional, z } from "zod";

const nonEmptyString = z.string().trim().min(1, "Cannot be empty");
const skillBulletItem = nonEmptyString.min(2, "Too short (min 2 characters)");

// CREATE schema – strict / required fields
const createReflextionSchema = z.object({
    extractedSkills: z
        .array(skillBulletItem)
        .min(1, "At least one extracted skill is required")
        .max(30, "Too many skills (max 30)"),

    impectBullects: z
        .array(skillBulletItem)
        .max(50, "Too many impact bullets (max 50)")
        .optional()
        .default([]),

    shortSummary: nonEmptyString.max(500, "Summary too long (max 500 characters)"),
});

// Type for controller/service (clean input)
export type CreateReflextionInput = z.infer<typeof createReflextionSchema>;

// UPDATE schema – everything optional, but still validated if present
const updateReflextionSchema = z.object({
    extractedSkills: z
        .array(skillBulletItem)
        .optional(),
    impectBullects: z
        .array(skillBulletItem)
        .max(50, "Too many impact bullets (max 50)")
        .optional()
        .default([]),

    shortSummary: nonEmptyString.optional(),
})

export const ReflextionValidation = {
    createReflextionSchema,
    updateReflextionSchema
}

export type UpdateReflextionInput = z.infer<typeof updateReflextionSchema>;