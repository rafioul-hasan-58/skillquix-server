import { Job } from "bullmq";
import { IEnhanceMaterCvChallange } from "../types/masterCv.types";
import { enhanceChallenge } from "../../../modules/masterCv/masterCv.helper";
import prisma from "../../../lib/prisma";


export const enhanceChallengeProcessor = async (job: Job<IEnhanceMaterCvChallange>) => {
    const { userId, data } = job.data;

    const enhancedChallange = await enhanceChallenge({
        userId,
        situation: data.situation,
        task: data.task,
        action: data.action,
        result: data.result
    });

    const enhancedData = {
        challengeName: enhancedChallange.data.challengeName,
        situation: enhancedChallange.data.situation,
        task: enhancedChallange.data.task,
        action: enhancedChallange.data.action,
        result: enhancedChallange.data.result
    }
    const existing = await prisma.enhancedMasterCv.findUnique({
        where: {
            userId
        }
    })

    await prisma.enhancedMasterCv.update({
        where: {
            userId
        },
        data: {
            challenges: [...(existing?.challenges as any[] ?? []), enhancedData],
        }
    })
};

