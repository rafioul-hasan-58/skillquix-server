import { z } from "zod";


const isoDateTimeRegex =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
const sendSessionRequestSchema = z.object({
    requestId: z.string(), // ensures it's a valid UUID
    topic: z.string().min(1, "Topic is required"),
    preferredTime: z
        .string()
        .regex(isoDateTimeRegex, "Must be a valid ISO-8601 datetime")
        .optional(), actionItems: z.array(z.string()).optional(), // array of strings if provided
});


export const SessionValidation = {
    sendSessionRequestSchema
}