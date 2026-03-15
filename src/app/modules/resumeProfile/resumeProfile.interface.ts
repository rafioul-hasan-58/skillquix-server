// Section item
interface ResumeSectionItemPayload {
  orderIndex: number;
  data: Record<string, any>;  // fully dynamic
}

// Section
interface ResumeSectionPayload {
  sectionType: string;
  title: string;
  orderIndex: number;
  items: ResumeSectionItemPayload[];
}
// Skills
export interface ResumeSkill {
  category: string;
  Skills: string[];
}

export interface CreateResumeProfilePayload {
  domain: string;
  subdomain: string;
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
  totalExp?: number;
  sections: ResumeSectionPayload[];
  skills: ResumeSkill[]
}