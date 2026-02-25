import { ProfilingLevel } from "mongodb";
import { z } from "zod";

const createSkillSchema = z.object({
    skillName: z
        .string()
        .min(2, "Skill name must be at least 2 characters")
        .max(50, "Skill name cannot exceed 50 characters")
        .trim(),

    skillCategory: z
        .string()
        .min(2, "Skill category must be at least 2 characters")
        .max(50, "Skill category cannot exceed 50 characters")
        .trim(),

    proficiencyLevel: z
        .nativeEnum(ProfilingLevel)
        .optional(),

    yearOfExperience: z
        .coerce
        .number({
            invalid_type_error: "Year of experience must be a number"
        })
        .int("Year of experience must be an integer")
        .min(0, "Experience cannot be negative")
        .max(50, "Experience seems unrealistic")
        .optional(),
});

export const SkillValidations = {
    createSkillSchema
}