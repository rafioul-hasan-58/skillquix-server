import { z } from "zod";

const experienceSchema = z.object({
    workingRole: z
        .string({ required_error: "Working role is required" })
        .min(1, "Working role cannot be empty"),

    companyName: z
        .string({ required_error: "Company name is required" })
        .min(1, "Company name cannot be empty"),

    description: z
        .string()
        .optional(),

    startDate: z
        .string({ required_error: "Start date is required" })
        .refine((date) => !isNaN(Date.parse(date)), {
            message: "Invalid start date format",
        }),

    endDate: z
        .string()
        .optional()
        .nullable()
        .refine((date) => {
            if (!date) return true;
            return !isNaN(Date.parse(date));
        }, {
            message: "Invalid end date format",
        }),
});

const educationSchema = z.object({
    degreeName: z
        .string({ required_error: "Degree name is required" })
        .min(1, "Degree name cannot be empty"),

    instituteName: z
        .string({ required_error: "Institute name is required" })
        .min(1, "Institute name cannot be empty"),

    startDate: z
        .string({ required_error: "Start date is required" })
        .refine((date) => !isNaN(Date.parse(date)), {
            message: "Invalid start date format",
        }),

    endDate: z
        .string()
        .optional()
        .nullable()
        .refine((date) => {
            if (!date) return true;
            return !isNaN(Date.parse(date));
        }, {
            message: "Invalid end date format",
        }),
});

const skillSchema = z.object({
    skillName: z
        .string({ required_error: "Skill name is required" })
        .min(1, "Skill name cannot be empty"),
});

const createResumeSchema = z.object({
    name: z
        .string({ required_error: "Name is required" })
        .min(1, "Name cannot be empty"),

    title: z
        .string({ required_error: "Title is required" })
        .min(1, "Title cannot be empty"),

    email: z
        .string({ required_error: "Email is required" })
        .email("Invalid email format"),

    location: z
        .string({ required_error: "Location is required" })
        .min(1, "Location cannot be empty"),

    phone: z
        .string({ required_error: "Phone is required" })
        .min(1, "Phone cannot be empty"),

    summary: z
        .string()
        .optional(),

    experiences: z
        .array(experienceSchema)
        .optional(),

    education: z
        .array(educationSchema)
        .optional(),

    skills: z
        .array(skillSchema)
        .optional(),
});
const updateResumeSchema = z
    .object({
        email: z
            .string()
            .email("Invalid email format")
            .optional(),

        location: z
            .string()
            .min(1, "Location cannot be empty")
            .optional(),

        phone: z
            .string()
            .min(6, "Phone number is too short")
            .max(20, "Phone number is too long")
            .regex(/^[0-9+\-\s()]+$/, "Invalid phone number format")
            .optional(),

        summary: z
            .string()
            .min(10, "Summary should be at least 10 characters")
            .optional(),
    })
    .strict();

const updateWorkExperienceSchema = z.array(
    z.object({
        id: z
            .string()
            .min(1, "Experience id is required"),

        workingRole: z
            .string()
            .min(1, "Working role cannot be empty")
            .optional(),

        companyName: z
            .string()
            .min(1, "Company name cannot be empty")
            .optional(),

        description: z
            .string()
            .min(1, "Description cannot be empty")
            .optional(),

        startDate: z
            .coerce
            .date()
            .optional(),

        endDate: z
            .coerce
            .date()
            .nullable()
            .optional(),
    })
);

export const updateEducationSchema = z.array(
    z.object({
        id: z.string().min(1),
        degreeName: z.string().optional(),
        instituteName: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.coerce.date().optional(),
    })
);
export const ResumeValidation = {
    createResumeSchema,
    updateResumeSchema,
    updateWorkExperienceSchema,
    updateEducationSchema
}