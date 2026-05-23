import { z } from "zod";

// ─── Shared base schema ────────────────────────────────────────────────────────

const baseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Title is required"),
  email: z.string().email("Must be a valid email"),
  address: z.string().min(1, "Address is required"),
  phone: z.string().min(1, "Phone is required"),
  profileImage: z.string().url("Must be a valid URL").optional(),
  linkedin: z.string().url("Must be a valid URL").optional(),
  portfolio: z.string().url("Must be a valid URL").optional(),
});

// ─── Template 04 Schema ────────────────────────────────────────────────────────

export const temp04Schema = baseSchema.extend({
  profile: z.string().min(1, "Profile summary is required"),

  skills: z
    .array(z.string().min(1, "Skill cannot be empty"))
    .min(1, "At least one skill is required"),

  certifications: z
    .array(z.string().min(1, "Certification cannot be empty"))
    .optional()
    .default([]),

  education: z
    .array(
      z.object({
        degree: z.string().min(1, "Degree is required"),
        university: z.string().min(1, "University is required"),
        period: z.string().optional(),
        gpa: z.string().optional(),
      })
    )
    .min(1, "At least one education entry is required"),

  experience: z
    .array(
      z.object({
        role: z.string().min(1, "Role is required"),
        company: z.string().min(1, "Company is required"),
        bullets: z
          .array(z.string().min(1, "Bullet cannot be empty"))
          .min(1, "At least one achievement bullet is required"),
      })
    )
    .min(1, "At least one experience entry is required"),
});

export type ITemp04ResumeData = z.infer<typeof temp04Schema>;

// ─── Template 05 Schema ────────────────────────────────────────────────────────

export const temp05Schema = baseSchema.extend({
  firstName: z.string().min(1, "First name is required"),
  // `name` from baseSchema is used as last name (displayed large)
  // `title` from baseSchema is used as job title (displayed small at top)

  summary: z.string().min(1, "Summary is required"),

  website: z.string().optional(),

  skills: z
    .array(z.string().min(1, "Skill cannot be empty"))
    .min(1, "At least one skill is required"),

  education: z
    .array(
      z.object({
        school: z.string().min(1, "School name is required"),
        institution: z.string().optional(),
        period: z.string().optional(),
      })
    )
    .min(1, "At least one education entry is required"),

  experience: z
    .array(
      z.object({
        title: z.string().min(1, "Job title is required"),
        company: z.string().min(1, "Company is required"),
        period: z.string().optional(),
        bullets: z
          .array(z.string().min(1, "Bullet cannot be empty"))
          .min(1, "At least one achievement bullet is required"),
      })
    )
    .min(1, "At least one experience entry is required"),
});

export type ITemp05ResumeData = z.infer<typeof temp05Schema>;