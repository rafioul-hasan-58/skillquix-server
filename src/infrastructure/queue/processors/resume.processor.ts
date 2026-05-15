import { Job } from "bullmq";
import { ResumeExtractJobPayload } from "../types/queue.types";
import { parseResume } from "../../../modules/user/user.helper";
import { ResumeProfileService } from "../../../modules/resumeProfile/resumeProfile.service";
import { CreateResumeProfilePayload } from "../../../modules/resumeProfile/resumeProfile.interface";

export const resumeProcessor = async (job: Job<ResumeExtractJobPayload>) => {
  const { userId, resumeUrl } = job.data;

  const parsedResume = await parseResume(resumeUrl);

  const resumePayload: CreateResumeProfilePayload = {
    domain: parsedResume.domain,
    subdomain: parsedResume.subdomain,
    name: parsedResume.name,
    email: parsedResume.email,
    phone: parsedResume.phone,
    location: parsedResume.location,
    summary: parsedResume.summary,
    totalExp: parsedResume.totalExp,
    skills: parsedResume.skills,
    sections: parsedResume.sections.map((section: any) => ({
      sectionType: section.sectionType,
      title: section.title,
      orderIndex: section.orderIndex,
      items: section.items.map((item: any) => ({
        orderIndex: item.orderIndex,
        data: item.data,
      })),
    })),
  };

  await ResumeProfileService.create(userId, resumePayload);
};