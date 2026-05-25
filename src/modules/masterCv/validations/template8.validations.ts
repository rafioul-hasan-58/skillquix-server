import { z } from "zod";

// ─── Shared base schema ───────────────────────────────────────────────────────

const baseSchema = z.object({
  name:         z.string().min(1, "name is required"),
  title:        z.string().min(1, "title is required"),
  email:        z.string().email("must be a valid email"),
  phone:        z.string().min(1, "phone is required"),
  address:      z.string().min(1, "address is required"),
  profileImage: z.string().url().optional(),
  linkedin:     z.string().url().optional(),
  portfolio:    z.string().url().optional(),
});

// ─── Template 8 schema ────────────────────────────────────────────────────────

export const temp08Schema = baseSchema.extend({
  summary: z.string().min(1, "summary is required"),

  skills: z
    .array(z.string().min(1, "skill cannot be empty"))
    .min(1, "at least one skill required"),

  education: z
    .array(
      z.object({
        degree:      z.string().min(1, "degree is required"),
        institution: z.string().min(1, "institution is required"),
        period:      z.string().min(1, "period is required"),
      })
    )
    .min(1, "at least one education entry required"),

  languages: z
    .array(
      z.object({
        language: z.string().min(1, "language is required"),
        level:    z.string().min(1, "level is required"),
      })
    )
    .optional()
    .default([]),

  experience: z
    .array(
      z.object({
        title:   z.string().min(1, "job title is required"),
        company: z.string().min(1, "company is required"),
        period:  z.string().min(1, "period is required"),
        bullets: z
          .array(z.string().min(1, "bullet cannot be empty"))
          .optional()
          .default([]),
      })
    )
    .min(1, "at least one experience entry required"),
});

export type ITemp8ResumeData = z.infer<typeof temp08Schema>;