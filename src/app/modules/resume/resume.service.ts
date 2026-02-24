import { Education, Exparience, Resume, ResumeSkill } from "@prisma/client";
import prisma from "../../lib/prisma";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { createResume, updateEducation, updateSkill, updateWorkExperience } from "./resume.interface";




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

        // Delete existing nested records first (for clean upsert)
        const existingResume = await prisma.resume.findUnique({
            where: { userId },
            select: { id: true }
        });

        if (existingResume) {
            // Clean up existing nested data before updating
            await prisma.$transaction([
                prisma.exparience.deleteMany({ where: { resumeId: existingResume.id } }),
                prisma.education.deleteMany({ where: { resumeId: existingResume.id } }),
                prisma.resumeSkill.deleteMany({ where: { resumeId: existingResume.id } }),
            ]);
        }

        const resume = await prisma.resume.upsert({
            where: { userId },
            update: {
                name,
                title,
                email,
                location,
                phone,
                summary,
                expariences: {
                    create: experiences?.map((exp: any) => ({
                        workingRole: exp.workingRole,
                        companyName: exp.companyName,
                        description: exp.description,
                        startDate: new Date(exp.startDate),
                        endDate: exp.endDate ? new Date(exp.endDate) : null,
                    })),
                },
                education: {
                    create: education?.map((edu: any) => ({
                        degreeName: edu.degreeName,
                        instituteName: edu.instituteName,
                        startDate: new Date(edu.startDate),
                        endDate: edu.endDate ? new Date(edu.endDate) : null,
                    })),
                },
                resumeSkills: {
                    create: skills?.map((skill: any) => ({
                        skillName: skill.skillName,
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
                expariences: {
                    create: experiences?.map((exp: any) => ({
                        workingRole: exp.workingRole,
                        companyName: exp.companyName,
                        description: exp.description,
                        startDate: new Date(exp.startDate),
                        endDate: exp.endDate ? new Date(exp.endDate) : null,
                    })),
                },
                education: {
                    create: education?.map((edu: any) => ({
                        degreeName: edu.degreeName,
                        instituteName: edu.instituteName,
                        startDate: new Date(edu.startDate),
                        endDate: edu.endDate ? new Date(edu.endDate) : null,
                    })),
                },
                resumeSkills: {
                    create: skills?.map((skill: any) => ({
                        skillName: skill.skillName,
                    })),
                },
            },
            include: {
                expariences: true,
                education: true,
                resumeSkills: true,
            },
        });

        return resume;
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
            // await tx.exparience.deleteMany({ where: { resumeId } });

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
                expariences: {
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
                resumeSkills: {
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
    updateWorkExperience: async (payload: updateWorkExperience[]) => {
        for (const exp of payload) {
            const existingExp = await prisma.exparience.findUnique({
                where: {
                    id: exp.id
                }
            });

            if (!existingExp) {
                throw new ApiError(httpStatus.NOT_FOUND, `Experience with id ${exp.id} not found!`);
            }

            await prisma.exparience.update({
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
    updateResumeSkills: async (payload: updateSkill[]) => {
        for (const skill of payload) {
            const existingSkills = await prisma.resumeSkill.findUnique({
                where: {
                    id: skill.id
                }
            });

            if (!existingSkills) {
                throw new ApiError(httpStatus.NOT_FOUND, `Skill with id ${skill.id} not found!`);
            }

            await prisma.resumeSkill.update({
                where: {
                    id: skill.id,
                },
                data: {
                    skillName: skill.skillName,

                }
            })
        }
        return { message: "Skills updated successfully!" }
    }
}