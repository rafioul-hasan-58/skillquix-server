import { Worker } from "bullmq";
import { redisConnection } from "../connection/redis.client";
import { resumeProcessor } from "../processors/resume.processor";
import { QUEUE_NAMES } from "../queue.constant";

export const createResumeWorker = () =>
  new Worker(QUEUE_NAMES.RESUME, resumeProcessor, {
    connection: redisConnection,
    concurrency: 5,
  });