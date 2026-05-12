import { z } from "zod";

const loginValidationSchema = z.object({
	email: z.string().email({ message: "Invalid email address" }),
	password: z
		.string()
		.min(6, { message: "Password must be at least 6 characters long" }),
});

const changePasswordValidationSchema = z.object({
	currentPassword: z
		.string({ required_error: "Current password is required" })
		.min(6, {
			message: "Current password must be at least 6 characters long",
		}),
	newPassword: z
		.string({ required_error: "New password is required" })
		.min(6, { message: "New password must be at least 6 characters long" }),
});

const resetPasswordValidationSchema = z.object({
	newPassword: z.string().min(6, "Password must be at least 6 characters"),
	confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
	message: "Passwords do not match!",
	path: ["confirmPassword"],
});

const forgotPasswordValidationSchema = z.object({
	email: z.string().email({ message: "Invalid email address" }),
});



const resendOtpValidationSchema = z.object({
	email: z.string().email({ message: "Invalid email address" }),
});
const verifyOTPSchema = z.object({
	email: z.string().email({ message: "Invalid email address" }),
	otp: z.number().min(6, "Number will be at least 6 character")
});
const googleLoginValidationSchema = z.object({
	token: z.string().regex(
		/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/,
		{ message: "Invalid Google OAuth token format" }
	)
});
export const AuthValidation = {
	verifyOTPSchema,
	loginValidationSchema,
	resendOtpValidationSchema,
	googleLoginValidationSchema,
	resetPasswordValidationSchema,
	changePasswordValidationSchema,
	forgotPasswordValidationSchema,
};