import { ActivityType } from "@prisma/client";
import prisma from "../../lib/prisma";


export const ActivityLogService = {
    add: async (userId: string, action: ActivityType) => {
        const result = await prisma.activityLog.create({
            data: {
                userId,
                action
            }
        });
        return result
    }
}