import { Server } from "http";
import app from "./app";
import config from "./config";
import { seedAdmin } from "./shared/utils/seedAdmin";
import prisma from "./lib/prisma";
import { startCompleteExpiredSessionsJob } from "./infrastructure/jobs/completeExpiredSessions";
import { startWorkers } from "./infrastructure/queue/workers";

let server: Server;

async function bootstrap() {
  // 1. Connect DB first
  await prisma.$connect();
  console.log("☑️  Database connected!");

  // 2. Seed admin
  await seedAdmin();
  startWorkers()
  console.log("☑️  Workers started!");

  // 4. Start cron jobs
  startCompleteExpiredSessionsJob();
  console.log("☑️  Cron jobs started!");

  // 5. Start HTTP server last
  server = app.listen(config.port, () => {
    console.log(`☑️  Server running on port ${config.port}`);
  });
}

const exitHandler = () => {
  if (server) {
    server.close(async () => {
      await prisma.$disconnect(); // ← clean DB disconnect
      console.info("🛑 Server closed!");
    });
  }
  process.exit(1);
};

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  exitHandler();
});

process.on("unhandledRejection", (error) => {
  console.error("❌ Unhandled Rejection:", error);
  exitHandler();
});

bootstrap().catch((error) => {
  console.error("❌ Failed to start server:", error);
  process.exit(1);
});
