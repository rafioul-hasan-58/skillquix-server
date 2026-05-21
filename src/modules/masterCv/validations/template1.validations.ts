// validators/templateSchemas.ts
import { z } from "zod";

const educationSchema = z.object({
  startYear: z.string(),
  endYear: z.string(),
  institution: z.string(),
  degree: z.string(),
  points: z.array(z.string()),
});

const experienceSchema = z.object({
  role: z.string(),
  startYear: z.string(),
  endYear: z.string(),
  company: z.string(),
  points: z.array(z.string()),
});

const baseSchema = z.object({
  name: z.string(),
  title: z.string(),
  profileImage: z.string().optional(),
  about: z.string(),
  email: z.string().email(),
  address: z.string(),
  phone: z.string(),
  linkedin: z.string().optional(),
  portfolio: z.string().optional(),
});

// temp-01: has education + experience
export const temp01Schema = baseSchema.extend({
  education: z.array(educationSchema),
  experience: z.array(experienceSchema),
});

