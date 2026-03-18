import { z } from "zod";



const sendSessionRequestSchema = z.object({
    requestId: z.string(), // ensures it's a valid UUID
    menteeRequestNote: z.string().min(1, "Note is required"),
    actionItems: z.array(z.string())
});
const acceptSessionRequestSchema = z.object({
    sessionId: z.string(), // you can add .uuid() if it's always a UUID
    startDateTime: z.string().datetime({ message: "Start date/time must be ISO format" }),
    endDateTime: z.string().datetime({ message: "End date/time must be ISO format" }),
    meetLink: z.string().url("Meet link must be a valid URL")
});
const declineSessionRequestSchema = z.object({
    sessionId: z.string(), // you can add .uuid() if it's always a UUID
    declineReason: z.string().min(1, "Decline reason is required")
});
export const sessionScheduleSchema = z.object({
    startDateTime: z.string().datetime({ message: "Invalid startDateTime format. Use ISO 8601 (e.g. 2026-03-12T13:15:00.000Z)" }),
    endDateTime: z.string().datetime({ message: "Invalid endDateTime format. Use ISO 8601 (e.g. 2026-03-12T13:45:00.000Z)" }),
});


export const SessionValidation = {
    sendSessionRequestSchema,
    acceptSessionRequestSchema,
    sessionScheduleSchema,
    declineSessionRequestSchema,
}