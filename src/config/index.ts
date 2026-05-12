import path from "path";

// must use require — import statements are hoisted above dotenv.config()
require("dotenv").config({ path: path.join(process.cwd(), ".env") });

import { validateEnv } from "./env.validate";

const env = validateEnv();

export default {
  env: env.NODE_ENV,
  port: env.PORT,
  ai_base_url: env.AI_BASE_URL,
  backend_base_url: env.BACKEND_BASE_URL,
  frontend_url: env.FRONTEND_URL,
  image_url: env.IMAGE_URL,

  auth: {
    bcrypt_salt_rounds: Number(env.BCRYPT_SALT_ROUNDS),
    otp_expiry_time: Number(env.OTP_ACCESS_EXPIRES_IN),
  },

  jwt: {
    access_token_secret: env.JWT_ACCESS_SECRET,
    access_token_expires_in: env.JWT_ACCESS_EXPIRES_IN,
    refresh_token_secret: env.JWT_REFRESH_SECRET,
    refresh_token_expires_in: env.JWT_REFRESH_EXPIRES_IN,
  },

  admin: {
    email: env.ADMIN_EMAIL,
    password: env.ADMIN_PASSWORD,
    contact_email: env.CONTACT_EMAIL,
  },

  google: {
    service_account_path: env.GOOGLE_SERVICE_ACCOUNT_PATH,
    client_id: env.GOOGLE_CLIENT_ID,
    oauth: {
      client_id: env.OAUTH_CLIENT_ID,
      client_secret: env.OAUTH_CLIENT_SECRET,
      redirect_url: env.OAUTH_REDIRECT_URL,
    },
  },

  linkedin: {
    client_id: env.LINKEDIN_CLIENT_ID,
    client_secret: env.LINKEDIN_CLIENT_SECRET,
    redirect_uri: env.LINKEDIN_REDIRECT_URI,
  },

  smtp: {
    email: env.SMTP_EMAIL,
    pass: env.SMTP_PASS,
    email_from: env.SMTP_EMAIL_FROM,
    host: env.SMTP_HOST,
    name: env.SMTP_NAME,
    port: Number(env.SMTP_PORT),
  },

  stripe: {
    secret_key: env.STRIPE_SECRET_KEY,
    publishable_key: env.STRIPE_PUBLISHABLE_KEY,
    webhook_secret: env.STRIPE_WEBHOOK_SECRET,
  },

  s3: {
    access_key_id: env.S3_ACCESS_KEY,
    secret_access_key: env.S3_SECRET_KEY,
    region: env.S3_REGION,
    bucket_name: env.S3_BUCKET_NAME,
    endpoint: env.S3_ENDPOINT,
  },
};