import { z } from "zod";


// skills json validation
const ScoreBreakdownSchema = z.object({
  roleAlignment: z.number().min(0).max(100),
  experienceWeight: z.number().min(0).max(100),
});

const SkillSchema = z.object({
  skillName: z.string().min(1, "Skill name is required"),
  skillCategory: z.string().min(1, "Skill category is required").optional(),
  proficiencyLevel: z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]).optional(),
  yearOfExperience: z.number().int().min(0).optional(),
  source: z.enum(["MASTER_CV", "JOB_POSTING", "ASSESSMENT", "OTHER"]).optional(),
  score: z.number().min(0).max(100).optional(),
  scoreBreakdown: ScoreBreakdownSchema.optional(),
});
// ai score json validation
const AiScoreBreakdownSchema = z.object({
  profileCompleteness: z.number().min(0).max(100),
  skillRelevance: z.number().min(0).max(100),
  experienceClarity: z.number().min(0).max(100),
  careerNarrative: z.number().min(0).max(100),
  skillGapSeverity: z.number().min(0).max(100),
});

const AiScoreSchema = z.object({
  total: z.number().min(0).max(100),
  grade: z.string().min(1, "Grade is required"),
  summary: z.string().min(1, "Summary is required"),
  breakdown: AiScoreBreakdownSchema,
});
// challanges json validation
const ChallengeSchema = z.object({
  challengeName: z.string().min(1, "Challenge name is required"),
  situation: z.string().min(1, "Situation is required"),
  task: z.string().min(1, "Task is required"),
  action: z.string().min(1, "Action is required"),
  result: z.string().min(1, "Result is required"),
});
// educations and certifications json validation
const EducationAndCertificationSchema = z.object({
  degree: z.string().min(1, "Degree is required").optional().nullable(),
  certificateName: z.string().min(1, "Certificate name is required").optional().nullable(),
  institution: z.string().min(1, "Institution is required").optional().nullable(),
  organizationName: z.string().min(1, "Organization name is required").optional().nullable(),
  passingYear: z
    .string(),
  issueDate: z
    .string().optional()
});
// work experience json validation
const WorkExperienceSchema = z.object({
  company: z.string().min(1, "Company name is required"),
  position: z.string().min(1, "Position is required"),
  duration: z
    .string(),
  responsibilities: z.string().min(1, "Responsibilities are required"),
  projects: z
    .array(z.string().min(1, "Project name cannot be empty"))
    .min(1, "At least one project is required"),
});

// skill gaps json validations
const SkillGapScoreBreakdownSchema = z.object({
  roleAlignment: z.number().min(0).max(100),
  demandWeight: z.number().min(0).max(100),
});
const SkillGapSchema = z.object({
  skillName: z.string().min(1, "Skill name is required"),
  skillCategory: z.string().min(1, "Skill category is required"),
  proficiencyLevel: z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]),
  demandLevel: z.enum(["Low", "Medium", "High", "Critical"]),
  score: z.number().min(0).max(100),
  scoreBreakdown: SkillGapScoreBreakdownSchema,
  gapReason: z.string().min(1, "Gap reason is required"),
  suggestion: z.string().min(1, "Suggestion is required"),
  sourceCollection: z.enum([
    "DOMAIN_INFERRED",
    "MASTER_CV",
    "JOB_POSTING",
    "ASSESSMENT",
    "OTHER",
  ]),
});

const createEnhancedMasterCvValidationSchema = z.object({
  bio: z.string().optional(),
  careerStage: z.string().optional(),
  carrierGoal: z.string().optional(),
  currentRole: z.string().optional(),
  domain: z.string().optional(),
  email: z
    .string()
    .email("Invalid email address")
    .optional(),
  fullName: z.string().optional(),
  industry: z.string().optional(),
  linkedinUrl: z.string().url("Invalid LinkedIn URL").optional(),
  location: z.string().optional(),
  languages: z.array(z.string()).default([]),
  phoneNumber: z.string().optional(),
  portfolioUrl: z.string().url("Invalid portfolio URL").optional(),
  resumeSummary: z.string().optional(),
  resumeLink: z.string().url("Invalid resume URL").optional(),
  subDomain: z.string().optional(),
  totalExperienceYear: z.number().int().nonnegative().optional(),
  strength: z.array(z.string()).default([]),

  // JSON fields — kept as unknown; validate deeper if needed
  aiScore: AiScoreSchema,
  challenges: z.array(ChallengeSchema).default([]),
  educationsAndCertifications: z.array(EducationAndCertificationSchema).default([]),
  skills: z.array(SkillSchema).default([]),
  skillGaps: z.array(SkillGapSchema).default([]),
  workExperiences: z.array(WorkExperienceSchema).default([]),
});

export const EnhancedMasterCvValidation = {
  createEnhancedMasterCvValidationSchema,
};