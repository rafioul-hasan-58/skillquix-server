import { ActivityType } from "@prisma/client";
import prisma from "../../lib/prisma";


const add = async (userId: string, action: ActivityType) => {
    const result = await prisma.activityLog.create({
        data: {
            userId,
            action
        }
    });
    return result
};

export const ActivityLogService = {
    add
}