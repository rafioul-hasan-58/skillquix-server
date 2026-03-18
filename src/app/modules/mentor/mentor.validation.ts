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
const updateMentorProfileSchema = z.object({
    mentorName: z.string().min(2, "Mentor name must be at least 2 characters").optional(),
    role: z.string().min(2, "Role must be at least 2 characters").optional(),
    company: z.string().nullable().optional(),
    experienceYears: z.number().int().min(0, "Experience must be non-negative").optional(),
    skills: z
        .array(z.string().min(1, "Skill cannot be empty"))
        .nonempty("At least one skill required")
        .optional(),
    mentorshipDetails: z
        .string()
        .min(10, "Details must be at least 10 characters")
        .optional(),
    availability: z.string().min(3, "Availability must be specified").optional(),
    maxActiveMentees: z.number().int().min(1, "Must allow at least 1 mentee").optional(),
    isActive: z.boolean().optional(),
})

const mentorshipRequestSchema = z.object({
    mentorId: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, "mentorId must be a valid ObjectId"), // Ensures MongoDB ObjectId format
    matchPercentage: z
        .number({ required_error: "Match percentage is required!" }),
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

// Enum for status

const MentorshipCompletionSchema = z.object({
    requestId: z.string().min(1, "Request ID is required"), // ObjectId as string
    actionItems: z.array(z.string()).nonempty("At least one action item is required"),
});
const AcceptMentorshipCompletionSchema = z.object({
    completionId: z.string().min(1, "Request ID is required"), // ObjectId as string
    actionItems: z.array(z.string()).nonempty("At least one action item is required"),
});
const rejectMentorshipCompletionSchema = z.object({
    feedback: z.string().min(1, "Feedback is required"), // ObjectId as string
});

export const MentorValidations = {
    setupMentorProfileSchema,
    mentorshipRequestSchema,
    updateMentorProfileSchema,
    MentorshipCompletionSchema,
    AcceptMentorshipCompletionSchema,
    rejectMentorshipCompletionSchema
}
