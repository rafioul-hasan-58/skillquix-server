import { z } from "zod";

const setupMentorProfileSchema = z.object({
    mentorName: z.string().min(2, "Mentor name must be at least 2 characters"),
    role: z.string().min(2, "Role must be at least 2 characters"),
    company: z.string().optional(),
    experienceYears: z.number().int().min(0, "Experience must be non-negative"),
    skills: z.array(z.string().min(1, "Skill cannot be empty")).nonempty("At least one skill required"),
    mentorshipDetails: z.string().min(10, "Details must be at least 10 characters"),
    availability: z.string().min(3, "Availability must be specified"),
    maxActiveMentees: z.number().int().min(1, "Must allow at least 1 mentee"),
});
const mentorshipRequestSchema = z.object({
    mentorId: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, "mentorId must be a valid ObjectId"), // Ensures MongoDB ObjectId format
    learningGoals: z
        .string()
        .min(5, "Learning goals must be at least 5 characters long")
        .max(500, "Learning goals cannot exceed 500 characters"),
    actionItems: z
        .array(
            z.string().min(1, "Action item cannot be empty")
        )
        .min(1, "At least one action item is required")
        .max(20, "Too many action items"),
});
export const MentorValidations = {
    setupMentorProfileSchema,
    mentorshipRequestSchema
}
