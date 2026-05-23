import { z } from "zod";


const challengeSchema = z.object({
  situation: z.string({ required_error: "Situation is required", invalid_type_error: "Situation must be a string" }),
  task: z.string({ required_error: "Task is required", invalid_type_error: "Task must be a string" }),
  action: z.string({ required_error: "Action is required", invalid_type_error: "Action must be a string" }),
  result: z.string({ required_error: "Result is required", invalid_type_error: "Result must be a string" }),
})
const educationsAndCertifications = z.object({
  degree: z.string({ required_error: "Degree is required", invalid_type_error: "Degree must be a string" }),
  certificateName: z.string({ required_error: "Certificate Name is required", invalid_type_error: "Certificate Name must be a string" }),
  institution: z.string({ required_error: "Institution is required", invalid_type_error: "Institution must be a string" }),
  organizationName: z.string({ required_error: "Organization Name is required", invalid_type_error: "Organization Name must be a string" }),
  passingYear: z.string({ required_error: "Passing Year is required", invalid_type_error: "Passing Year must be a string" }),
  issueDate: z.string({ required_error: "Issue Date is required", invalid_type_error: "Issue Date must be a string" }),
})
const workExperiences = z.object({
  company: z.string({ required_error: "Organization Name is required", invalid_type_error: "Organization Name must be a string" }),
  position: z.string({ required_error: "Position is required", invalid_type_error: "Position must be a string" }),
  duration: z.string({ required_error: "Start Date is required", invalid_type_error: "Start Date must be a string" }),
  responsibilities: z.string({ required_error: "Responsibilities is required", invalid_type_error: "Responsibilities must be a string" }),
  projects: z.array(z.string()).default([]),
})
export const MasterCvSchema = z.object({
  fullName: z.string().optional(),
  email: z.string().email().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
  experienceYear: z.string().optional(),
  careerStage: z.string().optional(),
  resumeLink: z.string().url().optional(),
  domain: z.string().optional(),
  subDomain: z.string().optional(),
  resumeSummary: z.string().optional(),
  currentRole: z.string().optional(),
  industry: z.string().optional(),
  strength: z.array(z.string()).default([]),
  carrierGoal: z.string().optional(),
  linkedinUrl: z.string().url().optional(),
  portfolioUrl: z.string().url().optional(),
  phoneNumber: z.string().optional(),
  // ─── Add Json fields manually below ───────────────────────────
  challenges: z.array(challengeSchema),
  educationsAndCertifications: z.array(educationsAndCertifications),
  workExperiences: z.array(workExperiences),

}).strict();

export type MasterCvInput = z.infer<typeof MasterCvSchema>;

export const downloadMasterCv = z.object({
  templateId: z.enum(["temp-01", "temp-02", "temp-03", "temp-04", "temp-05", "temp-06", "temp-07", "temp-08", "temp-09", "temp-10"]),
  data: z.any({ required_error: "Data is required", invalid_type_error: "Data must be an object" })
}).strict();

export type DownloadMasterCvInput = z.infer<typeof downloadMasterCv>;