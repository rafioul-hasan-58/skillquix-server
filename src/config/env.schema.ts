import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().default("5000"),
  AI_BASE_URL: z.string().url(),
  BACKEND_BASE_URL: z.string().url(),
  FRONTEND_URL: z.string(),
  IMAGE_URL: z.string().url().optional(),

  BCRYPT_SALT_ROUNDS: z.string().default("12"),
  OTP_ACCESS_EXPIRES_IN: z.string().default("5"),

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),

  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(8),
  CONTACT_EMAIL: z.string().email(),

  GOOGLE_SERVICE_ACCOUNT_PATH: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string(),
  OAUTH_CLIENT_ID: z.string(),
  OAUTH_CLIENT_SECRET: z.string(),
  OAUTH_REDIRECT_URL: z.string().url(),

  LINKEDIN_CLIENT_ID: z.string(),
  LINKEDIN_CLIENT_SECRET: z.string(),
  LINKEDIN_REDIRECT_URI: z.string().url(),

  SMTP_EMAIL: z.string().email(),
  SMTP_PASS: z.string(),
  SMTP_EMAIL_FROM: z.string(),
  SMTP_HOST: z.string(),
  SMTP_NAME: z.string(),
  SMTP_PORT: z.string().default("587"),

  STRIPE_SECRET_KEY: z.string().startsWith("sk_"),
  STRIPE_PUBLISHABLE_KEY: z.string().startsWith("pk_"),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_"),

  S3_ACCESS_KEY: z.string(),
  S3_SECRET_KEY: z.string(),
  S3_REGION: z.string().default("nyc3"),
  S3_BUCKET_NAME: z.string(),
  S3_ENDPOINT: z.string().url(),

  REDIS_HOST: z.string().default("127.0.0.1"),
  REDIS_PORT: z.string().default("6379"),
  PUPPETEER_SKIP_DOWNLOAD: z.string().default("true"),
  PUPPETEER_EXECUTABLE_PATH: z.string().default("/usr/bin/chromium"),
});

export type Env = z.infer<typeof envSchema>;