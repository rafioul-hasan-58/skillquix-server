import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  google_service_account_path: process.env.GOOGLE_SERVICE_ACCOUNT_PATH,
  google_oauth: {
    client_id: process.env.OAUTH_CLIENT_ID,
    client_secret: process.env.OAUTH_CLIENT_SECRET,
    redirect_url: process.env.OAUTH_REDIRECT_URL,
  },
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  ai_base_url: process.env.AI_BASE_URL,
  backend_base_url: process.env.BACKEND_BASE_URL,
  super_admin_password: process.env.SUPER_ADMIN_PASSWORD,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS || "12",
  otp_expiry_time: process.env.OTP_ACCESS_EXPIRES_IN || "5",
  image_url: process.env.IMAGE_URL,
  environment: process.env.ENVIRONMENT,
  google_client_id: process.env.GOOGLE_CLIENT_ID,
  admin: {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD
  },
  jwt: {
    access_secret: process.env.JWT_ACCESS_SECRET,
    access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
    refresh_token_secret: process.env.JWT_REFRESH_SECRET,
    refresh_token_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
  },
  emailSender: {
    email: process.env.EMAIL,
    app_pass: process.env.EMAIL_PASSWORD,
  },
  smtp: {
    email: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASS,
    email_from: process.env.SMTP_EMAIL_FROM,
    host: process.env.SMTP_HOST,
    name: process.env.SMTP_NAME,
    port: process.env.SMTP_PORT
  },
  stripe: {
    secret_key: process.env.STRIPE_SECRET_KEY,
    publishable_key: process.env.STRIPE_PUBLISHABLE_KEY,
    webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
  },
  S3: {
    accessKeyId: process.env.S3_ACCESS_KEY || "DO002RGDJ947DJHJ9WDT",
    secretAccessKey:
      process.env.S3_SECRET_KEY ||
      "e5+/pko6Ojar51Hb8ojUKfq2HtXy+tnGKOfs3rIcEfo",
    region: process.env.S3_REGION || "nyc3",
    bucketName: process.env.S3_BUCKET_NAME || "smtech-space",
    endpoint: process.env.S3_ENDPOINT,
  },

};