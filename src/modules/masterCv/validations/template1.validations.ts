// validators/templateSchemas.ts
import { z } from "zod";

const educationSchema = z.object({
  startYear: z.string().min(4, "startYear is required"),
  endYear: z.string().min(4, "endYear is required"),
  institution: z.string().min(1, "institution is required"),
  degree: z.string().min(1, "degree is required"),
  points: z.array(z.string().min(1)).min(1, "At least one point is required"),
});

const experienceSchema = z.object({
  role: z.string().min(1, "role is required"),
  startYear: z.string().min(4, "startYear is required"),
  endYear: z.string().min(4, "endYear is required"),
  company: z.string().min(1, "company is required"),
  points: z.array(z.string().min(1)).min(1, "At least one point is required"),
});

const baseSchema = z.object({
  name: z.string().min(1, "name is required"),
  title: z.string().min(1, "title is required"),
  profileImage: z.string().url("profileImage must be a valid URL").optional(),
  about: z.string().min(1, "about is required"),
  email: z.string().email("Must be a valid email address"),
  address: z.string().min(1, "address is required"),
  phone: z.string().min(1, "phone is required"),
  linkedin: z.string().url("linkedin must be a valid URL").optional(),
  portfolio: z.string().url("portfolio must be a valid URL").optional(),
});

// temp-01: has education + experience
export const temp01Schema = baseSchema.extend({
  education: z
    .array(educationSchema)
    .min(1, "At least one education entry is required"),
  experience: z
    .array(experienceSchema)
    .min(1, "At least one experience entry is required"),
});

// Inferred type from schema (replaces manual IResumeData type)
export type IResumeData = z.infer<typeof temp01Schema>;
export type IEducation = z.infer<typeof educationSchema>;
export type IExperience = z.infer<typeof experienceSchema>;