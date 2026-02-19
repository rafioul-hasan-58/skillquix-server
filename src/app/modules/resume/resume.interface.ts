import { Education, Exparience, Resume, ResumeSkill } from "@prisma/client";

export interface createResume {
    name: string;
    title: string;
    email: string;
    location: string;
    phone: string;
    summary: string;
    experiences: Exparience[];
    education: Education[];
    skills: ResumeSkill[];
}

export interface updateWorkExperience {
    id: string;
    workingRole?: string;
    companyName?: string;
    description?: string;
    startDate?: Date;
    endDate?: Date | null;
}
export interface updateEducation {
    id: string;
    degreeName?: string;
    instituteName?: string;
    startDate?: string;
    endDate?: Date;
}
export interface updateSkill {
    id: string;
    skillName?: string;
}