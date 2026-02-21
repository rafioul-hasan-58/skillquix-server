import { z } from "zod";
import { ExparienceLevel, GigStatus, Source } from "@prisma/client";

// Create Gig Validation
const createGigValidationSchema = z.object({
    industryName: z.string().min(1, "Industry name is required"),
    industryEmail: z.string().email("Valid industry email is required"),
    gigTitle: z.string().min(1, "Gig title is required"),
    category: z.string().min(1, "Category is required"),
    source: z.nativeEnum(Source).optional().default(Source.MANUAL),
    description: z.string().min(1, "Description is required"),
    gigType: z.string().min(1, "Gig type is required"),
    exparienceLevel: z.nativeEnum(ExparienceLevel).optional().default(ExparienceLevel.MID_LEVEL),
    duration: z.string().min(1, "Duration is required"),
    location: z.string().min(1, "Location is required"),
    jobDescription: z.string().min(1, "Job description is required"),
    responsibilities: z.array(z.string()).optional(),
    benefits: z.array(z.string()).optional(),
    gigStatus: z.nativeEnum(GigStatus).optional().default(GigStatus.ACTIVE),
    validUntil: z.string().datetime("Valid until date is required"),

});

// Update Gig Validation
const updateGigValidationSchema = z.object({
    industryName: z.string().optional(),
    industryEmail: z.string().email().optional(),
    gigTitle: z.string().optional(),
    category: z.string().optional(),
    source: z.nativeEnum(Source).optional(),
    description: z.string().optional(),
    gigType: z.string().optional(),
    exparienceLevel: z.nativeEnum(ExparienceLevel).optional(),
    duration: z.string().optional(),
    location: z.string().optional(),
    jobDescription: z.string().optional(),
    responsibilities: z.array(z.string()).optional(),
    benefits: z.array(z.string()).optional(),
    gigStatus: z.nativeEnum(GigStatus).optional(),
    validUntil: z.string().datetime().optional(),
});

export const GigValidation = {
    createGigValidationSchema,
    updateGigValidationSchema,
};
