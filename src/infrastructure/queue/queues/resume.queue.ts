import { Queue } from "bullmq";
import { redisConnection } from "../connection/redis.client";
import { ResumeExtractJobPayload } from "../types/queue.types";
import { QUEUE_NAMES } from "../queue.constant";

export const resumeQueue = new Queue<ResumeExtractJobPayload>(
  QUEUE_NAMES.RESUME,
  { connection: redisConnection }
);