// ─────────────────────────────────────────────────────────────
//  RAW payload shape — exactly what the frontend sends
// ─────────────────────────────────────────────────────────────
export interface IRawCvPayload {
  fullName?: string;
  currentRole?: string;
  email?: string;
  phoneNumber?: string;
  location?: string;
  profileImage?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  website?: string;
  about?: string;
  summary?: string;
  profile?: string;
  resumeSummary?: string;
  firstName?: string;
  skills?: string[];
  languages?: { language: string; level: string }[];
  hobbies?: string[];
  certifications?: string[];

  // DB: actual education/certification records
  educationsAndCertifications?: IRawEducation[];

  // DB: actual work experience records
  workExperiences?: IRawExperience[];

  // nested user object from DB relation
  user?: { profileImage?: string };
}

// ─────────────────────────────────────────────────────────────
//  Sub-types for raw arrays (covers ALL DB field shapes)
// ─────────────────────────────────────────────────────────────
interface IRawEducation {
  // common
  degree?: string;
  institution?: string;
  period?: string;
  startYear?: string;
  endYear?: string;
  gpa?: string;
  honors?: string[];
  points?: string[];
  // template-04
  university?: string;
  // template-05
  school?: string;
  // DB cert fields
  certificateName?: string;
  organizationName?: string;
  passingYear?: string;
  issueDate?: string;
}

interface IRawExperience {
  // common
  title?: string;
  role?: string;
  company?: string;
  period?: string;
  startYear?: string;
  endYear?: string;
  bullets?: string[];
  points?: string[];
  description?: string;
  location?: string;
  // DB work experience fields
  position?: string;       // DB uses `position` not `role`/`title`
  duration?: string;       // DB uses `duration` not `period`
  responsibilities?: string; // DB uses single string not array
  projects?: string[];     // DB uses `projects` as bullet array
}

// ─────────────────────────────────────────────────────────────
//  NORMALISED payload — what every template generator expects
// ─────────────────────────────────────────────────────────────
export interface INormalisedCvPayload {
  // Identity
  name: string;
  firstName?: string;
  title: string;
  profileImage: string;

  // Contact
  email: string;
  phone: string;
  address: string;
  linkedin: string;
  portfolio: string;
  website: string;

  // Bio (all three names populated so every template works)
  about: string;
  summary: string;
  profile: string;

  // Lists
  skills: string[];
  certifications: string[];
  hobbies: string[];
  languages: { language: string; level: string }[];
  languagesFlat: string[]; // template-03 needs string[] e.g. "English - Native"

  // Core sections
  education: INormalisedEducation[];
  experience: INormalisedExperience[];
}

export interface INormalisedEducation {
  degree: string;
  institution: string;
  university: string;   // template-04 alias
  school: string;       // template-05 alias
  period: string;
  startYear: string;
  endYear: string;
  gpa: string;
  honors: string[];
  points: string[];
}

export interface INormalisedExperience {
  title: string;        // templates 03, 05, 08
  role: string;         // templates 01, 02, 04, 06, 07
  company: string;
  period: string;
  startYear: string;
  endYear: string;
  bullets: string[];    // templates 04, 05, 08
  points: string[];     // templates 01, 02, 07
  description: string;  // templates 06, 07
  location: string;     // template-03
}

// ─────────────────────────────────────────────────────────────
//  MAPPER
// ─────────────────────────────────────────────────────────────
export const mapPayloadToTemplateData = (
  raw: IRawCvPayload
): INormalisedCvPayload => {

  // ── EDUCATION comes from `educationsAndCertifications` ──────
  // DB fields: degree, certificateName, institution, organizationName,
  //            passingYear, issueDate, gpa, honors, points
  const education: INormalisedEducation[] = (
    raw.educationsAndCertifications ?? []
  ).map((item) => {
    const period =
      item.period ??
      (item.passingYear
        ? `${item.passingYear} - ${item.issueDate ?? ""}`.trim()
        : "");

    const institution =
      item.institution ?? item.organizationName ?? "";

    return {
      degree:      item.degree          ?? item.certificateName ?? "",
      institution,
      university:  item.university      ?? institution,   // template-04
      school:      item.school          ?? institution,   // template-05
      period,
      startYear:   item.startYear       ?? parsePeriodStart(period),
      endYear:     item.endYear         ?? parsePeriodEnd(period),
      gpa:         item.gpa             ?? "",
      honors:      item.honors          ?? [],
      points:      item.points          ?? [],
    };
  });

  // ── EXPERIENCE comes from `workExperiences` ─────────────────
  // DB fields: company, position, duration, responsibilities, projects
  const experience: INormalisedExperience[] = (
    raw.workExperiences ?? []
  ).map((item) => {
    // `responsibilities` is a plain string in DB — split into sentences for bullets
    const responsibilityBullets: string[] =
      item.responsibilities
        ? item.responsibilities
            .split(/(?<=[.!?])\s+/)
            .map((s: string) => s.trim())
            .filter(Boolean)
        : [];

    const bullets =
      item.bullets  ??
      item.projects ??
      responsibilityBullets;

    const points = item.points ?? bullets;

    // role: DB uses `position`, others use `role` or `title`
    const role  = item.position ?? item.role  ?? item.title ?? "";
    const title = item.title    ?? item.role  ?? item.position ?? "";

    // period: DB uses `duration` as a plain string e.g. "3 years"
    const period = item.period ?? item.duration ?? "";

    return {
      title,
      role,
      company:     item.company      ?? "",
      period,
      startYear:   item.startYear    ?? parsePeriodStart(period),
      endYear:     item.endYear      ?? parsePeriodEnd(period),
      bullets,
      points,
      description: item.description  ?? item.responsibilities ?? "",
      location:    item.location     ?? "",
    };
  });

  // ── Bio: DB uses `resumeSummary`, others use about/summary/profile ──
  const bioText =
    raw.resumeSummary ??
    raw.about         ??
    raw.summary       ??
    raw.profile       ??
    "";

  // ── profileImage: may be top-level OR nested in user relation ──
  const profileImage =
    raw.profileImage      ??
    raw.user?.profileImage ??
    "";

  return {
    // Identity
    name:         raw.fullName    ?? "",
    firstName:    raw.firstName   ?? "",
    title:        raw.currentRole ?? "",
    profileImage,

    // Contact
    email:     raw.email        ?? "",
    phone:     raw.phoneNumber  ?? "",
    address:   raw.location     ?? "",
    linkedin:  raw.linkedinUrl  ?? "",
    portfolio: raw.portfolioUrl ?? "",
    website:   raw.website      ?? "",

    // Bio — all three names so every template works without changes
    about:   bioText,
    summary: bioText,
    profile: bioText,

    // Lists
    skills:         raw.skills         ?? [],
    certifications: raw.certifications ?? [],
    hobbies:        raw.hobbies        ?? [],
    languages:      raw.languages      ?? [],
    languagesFlat:  (raw.languages ?? []).map(
      (l) => `${l.language} - ${l.level}`
    ),

    // Core sections (correctly mapped)
    education,
    experience,
  };
};

// ─────────────────────────────────────────────────────────────
//  Helpers — parse year out of a period string
// ─────────────────────────────────────────────────────────────
const parsePeriodStart = (period?: string): string => {
  if (!period) return "";
  const match = period.match(/(\d{4})/);
  return match ? match[1] : "";
};

const parsePeriodEnd = (period?: string): string => {
  if (!period) return "";
  const matches = period.match(/(\d{4})/g);
  return matches && matches.length > 1 ? matches[matches.length - 1] : "";
};