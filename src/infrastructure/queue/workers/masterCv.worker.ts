import { Worker } from "bullmq";
import { redisConnection } from "../connection/redis.client";
import { enhanceChallengeProcessor } from "../processors/masterCv.processor";
import { QUEUE_NAMES } from "../queue.constant";



export const createMasterCvWorker = () =>
    new Worker(QUEUE_NAMES.MASTER_CV, enhanceChallengeProcessor, {
        connection: redisConnection,
        concurrency: 5,
    });