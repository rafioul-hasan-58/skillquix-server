import { Certificate, Education, Experience, Language, OtherLink, Project, Skill, } from "@prisma/client";

export interface createResume {
    name: string;
    title: string;
    email: string;
    location: string;
    phone: string;
    summary: string;
    experiences: Experience[];
    education: Education[];
    skills: Skill[];
    projects: Project[]
    otherLinks: OtherLink[]
    languages: Language[]
    certificates: Certificate[]
}

export interface updateWorkExperience {
    id: string;
    workingRole?: string;
    companyName?: string;
    description?: string;
    startDate?: string;
    endDate?: string | null;
}
export interface updateEducation {
    id: string;
    degreeName?: string;
    instituteName?: string;
    startDate?: string;
    endDate?: string;
}
export interface updateSkill {
    id: string;
    skillName?: string;
}