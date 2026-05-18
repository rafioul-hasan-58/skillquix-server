import { createResumeWorker } from "./resume.worker";


const WORKER_CONFIG = [
  { name: "Resume", create: createResumeWorker },
  //   { name: "Email",     create: createEmailWorker },
  //   { name: "Embedding", create: createEmbeddingWorker },
]

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