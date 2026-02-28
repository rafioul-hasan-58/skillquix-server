import { ProficiencyLevel, SkillSource } from "@prisma/client";
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
    skillCategory: z
        .string({ required_error: "skillCategory is required" })
        .min(1, "skillCategory cannot be empty"),
    proficiencyLevel: z
        .string({ required_error: "proficiencyLevel is required" })
        .min(1, "proficiencyLevel cannot be empty"),
    yearOfExperience: z
        .number({ required_error: "yearOfExperience is required" })
        .min(1, "yearOfExperience cannot be empty"),
});
const projectSchema = z.object({
    name: z
        .string({ required_error: "Project name is required" })
        .min(1, "Project name cannot be empty"),

    link: z
        .string({ required_error: "Project link is required" })
        .url("Invalid project URL"),

    techStack: z
        .array(z.string().min(1))
        .min(1, "At least one tech stack is required"),

    description: z
        .array(z.string().min(1))
        .min(1, "At least one description point is required"),

    startDate: z
        .string({ required_error: "Start date is required" })
        .refine((date) => !isNaN(Date.parse(date)), {
            message: "Invalid start date format",
        }),

    endDate: z
        .string({ required_error: "End date is required" })
        .refine((date) => !isNaN(Date.parse(date)), {
            message: "Invalid end date format",
        }),
});

const otherLinkSchema = z.object({
    type: z
        .string({ required_error: "Link type is required" })
        .min(1, "Link type cannot be empty"),

    link: z
        .string({ required_error: "Link is required" })
        .url("Invalid URL"),
});

const languageSchema = z.object({
    name: z
        .string({ required_error: "Language name is required" })
        .min(1, "Language name cannot be empty"),
});

const certificateSchema = z.object({
    name: z
        .string({ required_error: "Certificate name is required" })
        .min(1, "Certificate name cannot be empty"),

    issueDate: z
        .string({ required_error: "Issue date is required" })
        .min(1, "Issue date cannot be empty"),
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
    projects: z.array(projectSchema).optional(),
    otherLinks: z.array(otherLinkSchema).optional(),
    languages: z.array(languageSchema).optional(),
    certificates: z.array(certificateSchema).optional(),
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
            .string()
            .optional(),

        endDate: z
            .string()
            .nullable()
            .optional(),
    })
);
const addWorkExperienceSchema = z.object({
    resumeId: z
        .string()
        .min(1, "Resume id is required"),

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
        .string()
        .optional(),

    endDate: z
        .string()
        .nullable()
        .optional(),
});
const updateEducationSchema = z.array(
    z.object({
        id: z.string().min(1),
        degreeName: z.string().optional(),
        instituteName: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.coerce.date().optional(),
    })
);
const addEducationSchema = z.object({
    resumeId: z.string().min(1),
    degreeName: z.string().optional(),
    instituteName: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.coerce.date().optional(),
});

const updateSkillsSchema = z.array(
    z.object({
        id: z.string().min(1), // assuming each skill has an id
        skillName: z.string().min(1).optional(),
        skillCategory: z.string().min(1).optional(),
        proficiencyLevel: z.nativeEnum(ProficiencyLevel).optional(),
        yearOfExperience: z.number().min(0).optional(),
        source: z.nativeEnum(SkillSource).optional()
    })
);
const addSkillSchema = z.object({
    resumeId: z.string().min(1), // assuming each skill has an id
    skillName: z.string().min(1).optional(),
    skillCategory: z.string().min(1).optional(),
    proficiencyLevel: z.nativeEnum(ProficiencyLevel).optional(),
    yearOfExperience: z.number().min(0).optional(),
    source: z.nativeEnum(SkillSource).optional()
});
// --- PROJECTS ---
const addProjectSchema = z.object({
    resumeId: z.string().min(1, "Resume id is required"),
    name: z.string().min(1, "Project name is required"),
    link: z.string().url("Invalid project link").min(1, "Project link is required"),
    techStack: z.array(z.string()).min(1, "At least one tech stack is required"),
    description: z.array(z.string()).min(1, "At least one description point is required"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
});

const updateProjectSchema = z.array(
    z.object({
        id: z.string().min(1, "Project id is required"),
        name: z.string().min(1).optional(),
        link: z.string().url("Invalid project link").optional(),
        techStack: z.array(z.string()).optional(),
        description: z.array(z.string()).optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
    })
);

// --- OTHER LINKS ---
const addOtherLinkSchema = z.object({
    resumeId: z.string().min(1, "Resume id is required"),
    type: z.string().min(1, "Link type is required"),
    link: z.string().url("Invalid URL").min(1, "Link is required"),
});

const updateOtherLinkSchema = z.array(
    z.object({
        id: z.string().min(1, "Link id is required"),
        type: z.string().min(1).optional(),
        link: z.string().url("Invalid URL").optional(),
    })
);

// --- LANGUAGES ---
const addLanguageSchema = z.object({
    resumeId: z.string().min(1, "Resume id is required"),
    name: z.string().min(1, "Language name is required"),
});

const updateLanguageSchema = z.array(
    z.object({
        id: z.string().min(1, "Language id is required"),
        name: z.string().min(1).optional(),
    })
);

// --- CERTIFICATES ---
const addCertificateSchema = z.object({
    resumeId: z.string().min(1, "Resume id is required"),
    name: z.string().min(1, "Certificate name is required"),
    issueDate: z.string().min(1, "Issue date is required"),
});

const updateCertificateSchema = z.array(
    z.object({
        id: z.string().min(1, "Certificate id is required"),
        name: z.string().min(1).optional(),
        issueDate: z.string().optional(),
    })
);

// --- ADD TO EXPORT ---
export const ResumeValidation = {
    // existing
    addSkillSchema,
    addEducationSchema,
    createResumeSchema,
    addWorkExperienceSchema,
    updateResumeSchema,
    updateSkillsSchema,
    updateEducationSchema,
    updateWorkExperienceSchema,
    // new
    addProjectSchema,
    updateProjectSchema,
    addOtherLinkSchema,
    updateOtherLinkSchema,
    addLanguageSchema,
    updateLanguageSchema,
    addCertificateSchema,
    updateCertificateSchema,
};