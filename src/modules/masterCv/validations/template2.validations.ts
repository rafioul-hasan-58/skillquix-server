// validators/templateSchemas.ts
import { z } from "zod";

const educationSchema = z.object({
    startYear: z.string().min(1, "Start year is required"),
    endYear: z.string().min(1, "End year is required"),
    institution: z.string().min(1, "Institution is required"),
    degree: z.string().min(1, "Degree is required"),
    points: z.array(z.string().min(1)).min(1, "At least one point is required"),
});

const experienceSchema = z.object({
    role: z.string().min(1, "Role is required"),
    startYear: z.string().min(1, "Start year is required"),
    endYear: z.string().min(1, "End year is required"),
    company: z.string().min(1, "Company is required"),
    points: z.array(z.string().min(1)).min(1, "At least one point is required"),
});
const baseSchema = z.object({
    name: z.string().min(1, "Name is required"),
    title: z.string().min(1, "Title is required"),
    profileImage: z.string().optional().default(""),
    about: z.string().min(1, "About is required"),
    email: z.string().email("Invalid email address"),
    address: z.string().min(1, "Address is required"),
    phone: z.string().min(1, "Phone is required"),
    linkedin: z.string().optional().default(""),
    portfolio: z.string().optional().default(""),
})
export const temp02Schema = baseSchema.extend({
    education: z.array(educationSchema).min(1, "At least one education entry is required"),
    experience: z.array(experienceSchema).min(1, "At least one experience entry is required"),
});