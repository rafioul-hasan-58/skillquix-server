import { z } from "zod";


const challengeSchema = z.object({
  challangeName: z.string({ required_error: "Challenge Name is required", invalid_type_error: "Challenge Name must be a string" }),
  impact: z.string({ required_error: "Impact is required", invalid_type_error: "Impact must be a string" }),
  achievement: z.string({ required_error: "Achievement is required", invalid_type_error: "Achievement must be a string" }),
  leadershipMoment: z.string({ required_error: "Leadership Moment is required", invalid_type_error: "Leadership Moment must be a string" }),
})
const educationsAndCertifications = z.object({
  degree: z.string({ required_error: "Degree is required", invalid_type_error: "Degree must be a string" }),
  certificateName: z.string({ required_error: "Certificate Name is required", invalid_type_error: "Certificate Name must be a string" }),
  institution: z.string({ required_error: "Institution is required", invalid_type_error: "Institution must be a string" }),
  organizationName: z.string({ required_error: "Organization Name is required", invalid_type_error: "Organization Name must be a string" }),
  passingYear: z.string({ required_error: "Passing Year is required", invalid_type_error: "Passing Year must be a string" }),
  issueDate: z.string({ required_error: "Issue Date is required", invalid_type_error: "Issue Date must be a string" }),
})
const workExpariences = z.object({
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
  workExpariences: z.array(workExpariences),

}).strict();

export type MasterCvInput = z.infer<typeof MasterCvSchema>;