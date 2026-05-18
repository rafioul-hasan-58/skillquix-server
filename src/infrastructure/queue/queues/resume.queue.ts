import { Queue } from "bullmq";
import { redisConnection } from "../connection/redis.client";
import { ResumeEmbedJobPayload, ResumeExtractJobPayload } from "../types/queue.types";
import { QUEUE_NAMES } from "../queue.constant";

export const resumeExtractionQueue = new Queue<ResumeExtractJobPayload>(
  QUEUE_NAMES.RESUME,
  { connection: redisConnection }
);

export const resumeEmbeddingQueue = new Queue<ResumeEmbedJobPayload>(
  QUEUE_NAMES.RESUME,
  { connection: redisConnection }
);