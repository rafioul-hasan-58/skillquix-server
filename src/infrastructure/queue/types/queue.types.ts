

// payload you send when adding the job
export interface ResumeExtractJobPayload {
  userId: string;
  resumeUrl: string;
}

export interface ResumeEmbedJobPayload {
  resumeProfileId: string;
  embedding: number[];
}