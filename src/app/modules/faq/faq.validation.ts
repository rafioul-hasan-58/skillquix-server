import { z } from "zod";

const createFaqValidationSchema = z.object({
  // TODO: add your fields here
  question: z.string({ required_error: "Question is required." }),
  answer: z.string({ required_error: "Answer is required." }),

});

const updateFaqValidationSchema = z.object({
  // TODO: add your fields here
  // name: z.string().optional(),
});

export const FaqValidation = {
  createFaqValidationSchema,
  updateFaqValidationSchema,
};
