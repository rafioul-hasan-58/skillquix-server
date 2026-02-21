import { SubscriptionType, Toggle, UserRole } from "@prisma/client";
import { z } from "zod";

// Enums for role and subscription type
const UserRoleEnum = z.nativeEnum(UserRole);
const SubscriptionTypeEnum = z.nativeEnum(SubscriptionType);

export const createUserValidationSchema = z.object({
  fullName: z.string({
    required_error: "Full name is required.",
    invalid_type_error: "Full name must be a string.",
  }),

  email: z
    .string({ required_error: "Email is required." })
    .email("Invalid email address"),

  password: z
    .string({
      required_error: "Password is required.",
      invalid_type_error: "Password must be a string.",
    })
    .min(6, "Password must be at least 6 characters long.")
    .optional(), // since Prisma allows `password?`

  profileImage: z.string().optional(),
  profession: z.string().optional(),
  location: z.string().optional(),
  exparienceYear: z.string().optional(),
  bio: z.string().optional(),
});


const updateUserValidationSchema = z.object({
  fullName: z
    .string({
      invalid_type_error: "Full name must be a string.",
    })
    .optional(),
  bio: z
    .string({
      invalid_type_error: "Bio must be a string.",
    })
    .optional(),

  profession: z
    .string({
      invalid_type_error: "Professional Title must be a string.",
    })
    .optional(),
  location: z
    .string({
      invalid_type_error: "Location Title must be a string.",
    })
    .optional(),
  emailNotification: z
    .nativeEnum(Toggle)
    .optional(),
  jobAlerts: z
    .nativeEnum(Toggle)
    .optional(),
  marketingEmails: z
    .nativeEnum(Toggle)
    .optional(),

});

export const UserValidation = {
  createUserValidationSchema,
  updateUserValidationSchema,
};
