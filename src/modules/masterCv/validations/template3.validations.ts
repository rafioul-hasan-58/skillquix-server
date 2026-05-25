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

// ─────────────────────────────────────────────────────────────────────────────
// temp-02: profile + skills + education (with gpa) + experience (no period)
// ─────────────────────────────────────────────────────────────────────────────

const temp02EducationSchema = z.object({
  startYear: z.string().min(4, "startYear is required"),
  endYear: z.string().min(4, "endYear is required"),
  institution: z.string().min(1, "institution is required"),
  degree: z.string().min(1, "degree is required"),
  gpa: z.string().optional(),
});

const temp02ExperienceSchema = z.object({
  company: z.string().min(1, "company is required"),
  role: z.string().min(1, "role is required"),
  points: z.array(z.string().min(1)).min(1, "At least one point is required"),
});

export const temp02Schema = baseSchema.extend({
  profile: z.string().min(1, "profile summary is required"),
  skills: z.array(z.string().min(1)).min(1, "At least one skill is required"),
  education: z
    .array(temp02EducationSchema)
    .min(1, "At least one education entry is required"),
  experience: z
    .array(temp02ExperienceSchema)
    .min(1, "At least one experience entry is required"),
});

export type ITemp2ResumeData = z.infer<typeof temp02Schema>;
export type ITemp2Education = z.infer<typeof temp02EducationSchema>;
export type ITemp2Experience = z.infer<typeof temp02ExperienceSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// temp-03: header photo top-right, left col (contact/languages/skills/hobbies),
//          right col (education with honors + experience with location/period)
// ─────────────────────────────────────────────────────────────────────────────

const temp03EducationSchema = z.object({
  degree: z.string().min(1, "degree is required"),
  institution: z.string().min(1, "institution is required"),
  honors: z.array(z.string()).optional().default([]),
});

const temp03ExperienceSchema = z.object({
  title: z.string().min(1, "title is required"),
  company: z.string().min(1, "company is required"),
  location: z.string().min(1, "location is required"),
  period: z.string().min(1, "period is required"),
  points: z.array(z.string().min(1)).min(1, "At least one point is required"),
});

export const temp03Schema = z.object({
  name: z.string().min(1, "name is required"),
  title: z.string().min(1, "title is required"),
  profileImage: z.string().url("profileImage must be a valid URL").optional(),
  profile: z.string().min(1, "profile summary is required"),
  phone: z.string().min(1, "phone is required"),
  email: z.string().email("Must be a valid email address"),
  website: z.string().optional(),
  address: z.string().min(1, "address is required"),
  languages: z.array(z.string().min(1)).optional().default([]),
  skills: z.array(z.string().min(1)).optional().default([]),
  hobbies: z.array(z.string().min(1)).optional().default([]),
  education: z
    .array(temp03EducationSchema)
    .min(1, "At least one education entry is required"),
  experience: z
    .array(temp03ExperienceSchema)
    .min(1, "At least one experience entry is required"),
});

export type ITemp3ResumeData = z.infer<typeof temp03Schema>;
export type ITemp3Education = z.infer<typeof temp03EducationSchema>;
export type ITemp3Experience = z.infer<typeof temp03ExperienceSchema>;