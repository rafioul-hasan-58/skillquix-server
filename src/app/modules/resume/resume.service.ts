import { Education, Experience, Resume, Skill, SkillSource } from "@prisma/client";
import prisma from "../../lib/prisma";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { createResume, updateEducation, updateSkill, updateWorkExperience } from "./resume.interface";
import { generateResumeEmbedding } from "./resume.helper";




export const ResumeService = {
    createResume: async (userId: string, payload: createResume) => {
        const {
            name,
            title,
            email,
            location,
            phone,
            summary,
            experiences,
            education,
            skills,
        } = payload;

        const embedding = await generateResumeEmbedding(payload);

        // Delete existing nested records first (for clean upsert)
        const existingResume = await prisma.resume.findUnique({
            where: { userId },
            select: { id: true }
        });

        if (existingResume) {
            // Clean up existing nested data before updating
            await prisma.$transaction([
                prisma.experience.deleteMany({ where: { resumeId: existingResume.id } }),
                prisma.education.deleteMany({ where: { resumeId: existingResume.id } }),
                prisma.skill.deleteMany({ where: { resumeId: existingResume.id } }),
            ]);
        }

        const result = await prisma.$transaction(async (tx) => {
            const resume = await tx.resume.upsert({
                where: { userId },
                update: {
                    name,
                    title,
                    email,
                    location,
                    phone,
                    summary,
                    embedding,
                    experiences: {
                        create: experiences?.map((exp: Experience) => ({
                            workingRole: exp.workingRole,
                            companyName: exp.companyName,
                            description: exp.description,
                            startDate: exp.startDate,
                            endDate: exp.endDate,
                        })),
                    },
                    education: {
                        create: education?.map((edu: Education) => ({
                            degreeName: edu.degreeName,
                            instituteName: edu.instituteName,
                            startDate: edu.startDate,
                            endDate: edu.endDate,
                        })),
                    },
                },
                create: {
                    userId,
                    name,
                    title,
                    email,
                    location,
                    phone,
                    summary,
                    embedding,
                    experiences: {
                        create: experiences?.map((exp: Experience) => ({
                            workingRole: exp.workingRole,
                            companyName: exp.companyName,
                            description: exp.description,
                            startDate: exp.startDate,
                            endDate: exp.endDate,
                        })),
                    },
                    education: {
                        create: education?.map((edu: Education) => ({
                            degreeName: edu.degreeName,
                            instituteName: edu.instituteName,
                            startDate: edu.startDate,
                            endDate: edu.endDate,
                        })),
                    },
                },
                include: {
                    experiences: true,
                    education: true,
                },
            });
            // Delete old skills
            await tx.skill.deleteMany({
                where: { resumeId: resume.id }
            });

            // Create all skills in ONE query
            if (skills?.length) {
                await tx.skill.createMany({
                    data: skills.map(skill => ({
                        userId,
                        resumeId: resume.id,
                        skillName: skill.skillName,
                        skillCategory: skill.skillCategory,
                        source: "RESUME",
                        proficiencyLevel: skill.proficiencyLevel,
                        yearOfExperience: skill.yearOfExperience,
                    })),
                });
            }
            return resume;
        });
        return result

    },
    deleteResume: async (resumeId: string) => {
        // Check if resume exists
        const resume = await prisma.resume.findUnique({
            where: { id: resumeId },
            select: { id: true },
        });
        if (!resume) {
            throw new ApiError(httpStatus.NOT_FOUND, "Resume not found!");
        }

        // Delete resume and all related child records in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // await tx.resumeSkill.deleteMany({ where: { resumeId } });
            // await tx.education.deleteMany({ where: { resumeId } });
            // await tx.experience.deleteMany({ where: { resumeId } });

            const deletedResume = await tx.resume.delete({ where: { id: resumeId } });
            return deletedResume;
        });

        return result;
    },
    getMyResume: async (userId: string) => {
        // Check if resume exists
        const result = await prisma.resume.findUnique({
            where: { userId },
            select: {
                id: true,
                name: true,
                title: true,
                email: true,
                location: true,
                phone: true,
                summary: true,
                createdAt: true,
                experiences: {
                    select: {
                        id: true,
                        workingRole: true,
                        companyName: true,
                        description: true,
                        startDate: true,
                        endDate: true,
                        createdAt: true
                    }
                },
                education: {
                    select: {
                        id: true,
                        degreeName: true,
                        instituteName: true,
                        startDate: true,
                        endDate: true,
                        createdAt: true
                    }
                },
                skills: {
                    select: {
                        id: true,
                        skillName: true,
                        createdAt: true
                    }
                }
            }
        });
        if (!result) {
            throw new ApiError(httpStatus.NOT_FOUND, "Resume not found!");
        }
        return result;
    },
    updatePersonalInfo: async (resumeId: string, payload: Partial<Resume>) => {
        const resume = await prisma.resume.findUnique({
            where: {
                id: resumeId
            },
            select: {
                id: true
            }
        });

        if (!resume) {
            throw new ApiError(httpStatus.NOT_FOUND, "Resume not found!");
        }

        const result = await prisma.resume.update({
            where: {
                id: resumeId
            },
            data: payload
        });
        return result

    },
    addWorkExperience: async (payload: Experience) => {
        const resume = await prisma.resume.findUnique({
            where: {
                id: payload.resumeId
            }
        });
        if (!resume) {
            throw new ApiError(httpStatus.NOT_FOUND, "Resume not Found!")
        }
        const result = await prisma.experience.create({
            data: {
                resumeId: payload.resumeId,
                workingRole: payload.workingRole,
                companyName: payload.companyName,
                description: payload.description,
                endDate: payload.endDate,
                startDate: payload.startDate
            }
        })

        return result
    },
    addEducation: async (payload: Education) => {
        const resume = await prisma.resume.findUnique({
            where: {
                id: payload.resumeId
            }
        });
        if (!resume) {
            throw new ApiError(httpStatus.NOT_FOUND, "Resume not Found!")
        }
        const result = await prisma.education.create({
            data: {
                resumeId: payload.resumeId,
                degreeName: payload.degreeName,
                instituteName: payload.instituteName,
                endDate: payload.endDate,
                startDate: payload.startDate
            }
        })
        return result
    },
    updateWorkExperience: async (payload: updateWorkExperience[]) => {
        for (const exp of payload) {
            const existingExp = await prisma.experience.findUnique({
                where: {
                    id: exp.id
                }
            });

            if (!existingExp) {
                throw new ApiError(httpStatus.NOT_FOUND, `Experience with id ${exp.id} not found!`);
            }

            await prisma.experience.update({
                where: {
                    id: exp.id,
                },
                data: {
                    workingRole: exp.workingRole,
                    companyName: exp.companyName,
                    description: exp.description,
                    endDate: exp.endDate,
                    startDate: exp.startDate
                }
            })
        }
        return { message: "Work experiences updated successfully!" }
    },
    updateEducation: async (payload: updateEducation[]) => {
        for (const edu of payload) {
            const existingEdu = await prisma.education.findUnique({
                where: {
                    id: edu.id
                }
            });

            if (!existingEdu) {
                throw new ApiError(httpStatus.NOT_FOUND, `Education with id ${edu.id} not found!`);
            }

            await prisma.education.update({
                where: {
                    id: edu.id,
                },
                data: {
                    degreeName: edu.degreeName,
                    instituteName: edu.instituteName,
                    endDate: edu.endDate,
                    startDate: edu.startDate
                }
            })
        }
        return { message: "Education updated successfully!" }
    },
    addResumeSkill: async (skill: Skill) => {
        if (!skill.resumeId) {
            throw new ApiError(httpStatus.NOT_FOUND, "Skill id is required!")
        }
        const resume = await prisma.resume.findUnique({
            where: {
                id: skill.resumeId
            }
        });

        if (!resume) {
            throw new ApiError(httpStatus.NOT_FOUND, "Resume not Found!")
        }
        const result = await prisma.skill.create({
            data: {
                skillName: skill.skillName,
                skillCategory: skill.skillCategory,
                proficiencyLevel: skill.proficiencyLevel,
                yearOfExperience: skill.yearOfExperience,
                source: skill.source
            }
        })
        return result
    },
    updateResumeSkills: async (payload: Partial<Skill>[]) => {
        for (const skill of payload) {
            const existingSkills = await prisma.skill.findUnique({
                where: {
                    id: skill.id
                }
            });

            if (!existingSkills) {
                throw new ApiError(httpStatus.NOT_FOUND, `Skill with id ${skill.id} not found!`);
            }

            await prisma.skill.update({
                where: {
                    id: skill.id,
                },
                data: {
                    skillName: skill.skillName,
                    skillCategory: skill.skillCategory,
                    proficiencyLevel: skill.proficiencyLevel,
                    yearOfExperience: skill.yearOfExperience,
                    source: skill.source

                }
            })
        }
        return { message: "Skills updated successfully!" }
    }
}