import { z } from 'zod';

const createAccomplishmentSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .min(3, 'Title must be at least 3 characters')
    .max(120, 'Title cannot exceed 120 characters')
    .trim(),

  description: z
    .string({ required_error: 'Description is required' })
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description cannot exceed 2000 characters')
    .trim(),

  date: z
    .string({ required_error: 'Date is required' })
    .refine(
      (val) => !isNaN(Date.parse(val)),
      { message: 'Invalid date format (use ISO format: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ)' }
    ),
});

const updateAccomplishmentSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(120, 'Title cannot exceed 120 characters')
    .trim()
    .optional(),

  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description cannot exceed 2000 characters')
    .trim()
    .optional(),

  date: z
    .string()
    .refine(
      (val) => !isNaN(Date.parse(val)),
      { message: 'Invalid date format' }
    )
    .optional(),
})


// Export all schemas
export const AccomplishmentValidation = {
  create: createAccomplishmentSchema,
  update: updateAccomplishmentSchema
};