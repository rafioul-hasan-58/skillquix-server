import express, { Application, NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import cors from "cors";
import router from "./app/routes";
import GlobalErrorHandler from "./app/errors/globalErrorHandler";
import path from "path";
import morgan from "morgan";
import { WebhookRoutes } from "./infrastructure/stripe/webhook/webhook.routes";
import corsOptions from "./config/cors";

const app: Application = express();

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../src/views"));

// Logging
app.use(morgan("dev"));

// CORS
app.use(cors(corsOptions));

// ⚠️ WEBHOOK MUST BE BEFORE express.json() — Stripe needs raw body
app.use(
  "/api/v1/webhooks",
  express.raw({ type: "application/json" }),
  WebhookRoutes
);
// Body parsers
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Static files
app.use("/uploads", express.static(path.join(__dirname, "..", "public", "uploads")));

//Routes
app.use("/api/v1", router);

// get raoclinical runnig response
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Raoclinical Server is running!",
  });
});
// 404 Handler
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

// Global error handler
app.use(GlobalErrorHandler);

export default app;