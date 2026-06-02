import { z } from "zod";

const createContactMessageValidationSchema = z.object({
  name: z.string({ required_error: "Name is required." }),
  email: z.string({ required_error: "Email is required." }).email("Invalid email address"),
  phoneNumber: z.string().optional(),
  organization: z.string().optional(),
  message: z.string({ required_error: "Message is required." }),
  messageCategory: z.string().optional(),
});

const sendFeedBack = z.object({
  message: z.string({ required_error: "Message is required." }),
});

export const ContactMessageValidation = {
  createContactMessageValidationSchema,
  sendFeedBack,
};
