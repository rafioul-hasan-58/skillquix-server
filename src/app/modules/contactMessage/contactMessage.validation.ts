import { z } from "zod";

const createContactMessageValidationSchema = z.object({
  name: z.string({ required_error: "Name is required." }),
  email: z.string({ required_error: "Email is required." }).email("Invalid email address"),
  phoneNumber: z.string().optional(),
  organization: z.string().optional(),
  message: z.string({ required_error: "Message is required." }),
  messageCategory: z.string().optional(),
});

const updateContactMessageValidationSchema = z.object({
  // TODO: add your fields here
  // name: z.string().optional(),
});

export const ContactMessageValidation = {
  createContactMessageValidationSchema,
  updateContactMessageValidationSchema,
};
