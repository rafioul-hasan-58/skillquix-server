import { createMasterCvWorker } from "./masterCv.worker";
import { createResumeWorker } from "./resume.worker";

const WORKER_CONFIG = [
  { name: "Resume", create: createResumeWorker },
  { name: "MasterCv", create: createMasterCvWorker },
];

export const startWorkers = () => {
  WORKER_CONFIG.forEach(({ name, create }) => {
    const worker = create();

    worker.on("completed", (job) =>
      console.log(`✅ [${name}] Job ${job.id} completed`)
    );

    worker.on("failed", (job, error) =>
      console.error(`❌ [${name}] Job ${job?.id} failed:`, error.message)
    );
  });
};