import { QUEUE_NAMES } from "../queue.constant";
import { Queue } from "bullmq";
import { IEnhanceMaterCvChallange } from "../types/masterCv.types";
import { redisConnection } from "../connection/redis.client";


export const enhanceChallengeQueue = new Queue<IEnhanceMaterCvChallange>(
  QUEUE_NAMES.MASTER_CV,
  { connection: redisConnection }
);