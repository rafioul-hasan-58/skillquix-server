import { z } from "zod";

// Define schema
const updateSectionSchema = z.object({
    sectionType: z.string().min(1).optional(),   // must be a non-empty string
    title: z.string().min(1).optional(),         // must be a non-empty string
    orderIndex: z.number().int().nonnegative().optional() // must be a non-negative integer
});


export const ResumeProfileValidation = {
    updateSectionSchema
}