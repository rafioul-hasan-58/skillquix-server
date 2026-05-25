import { Worker } from "bullmq";
import { redisConnection } from "../connection/redis.client";
import { QUEUE_NAMES } from "../queue.constant";
import { resumeProcessor } from "../processors/resume.processor";

export const createResumeWorker = () =>
  new Worker(QUEUE_NAMES.RESUME, resumeProcessor, {
    connection: redisConnection,
    concurrency: 5,
  });