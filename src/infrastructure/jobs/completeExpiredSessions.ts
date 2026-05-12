import cron from "node-cron";
import prisma from "../../lib/prisma";

export const startCompleteExpiredSessionsJob = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const result = await prisma.mentorshipSession.updateMany({
        where: {
          endDateTime: { lt: new Date() },
          status: { not: "COMPLETED" },
        },
        data: { status: "COMPLETED" },
      });

      if (result.count > 0) {
        console.log(`🎯 Marked ${result.count} session(s) as COMPLETED`);
      }
    } catch (error) {
      console.error("❌ Cron job failed:", error);
    }
  });
};