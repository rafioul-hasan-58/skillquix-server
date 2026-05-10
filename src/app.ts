import express, { Application, NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import cors from "cors";
import router from "./app/routes";
import GlobalErrorHandler from "./app/errors/globalErrorHandler";
import { PrismaClient } from "@prisma/client";
import path from "path";
import morgan from "morgan";
import { WebhookRoutes } from "./app/stripe/webhook/webhook.routes";
import cron from "node-cron";

const app: Application = express();
const prisma = new PrismaClient();

const corsOptions = {
  origin: ["http://localhost:3000", "http://72.62.87.243:3001", "https://www.skillquix.tech", "https://dev.skillquix.tech"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

prisma
  .$connect()
  .then(() => console.log("✅ Database connected successfully!"))
  .catch((error) => console.error("Failed to connect to the database:", error));

app.use(morgan("dev"));
app.use(cors(corsOptions));

// ⚠️ WEBHOOK MUST BE BEFORE express.json() — Stripe needs raw body
app.use(
  "/api/v1/webhooks",
  express.raw({ type: "application/json" }),
  WebhookRoutes
);

// Normal middleware after webhook
app.use(express.json({ limit: "3000mb" }));
app.use(express.urlencoded({ extended: true, limit: "3000mb", parameterLimit: 100000 }));
app.use("/uploads", express.static(path.join(__dirname, "..", "public", "uploads")));

app.get("/", (req: Request, res: Response) => {
  res.send({ Message: "raoclinical server is running!" });
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../src/views"));

app.get("/payment", (req: Request, res: Response) => {
  res.render("stripe");
});

// cron

// runs every minute
cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();

    const result = await prisma.mentorshipSession.updateMany({
      where: {
        endDateTime: { lt: now },
        status: { not: "COMPLETED" },
      },
      data: {
        status: "COMPLETED",
      },
    });

    if (result.count > 0) {
      console.log(`🎯 Marked ${result.count} session(s) as COMPLETED`);
    }
  } catch (error) {
    console.error("❌ Cron job failed:", error);
  }
});

app.use("/api/v1", router);

app.use(GlobalErrorHandler);

app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "API NOT FOUND!",
    error: {
      path: req.originalUrl,
      message: "Your requested path is not found!",
    },
  });
});

export default app;