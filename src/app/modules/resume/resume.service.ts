import { Education, Exparience, Resume, ResumeSkill } from "@prisma/client";
import prisma from "../../lib/prisma";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { createResume, updateEducation, updateWorkExperience } from "./resume.interface";




export const ResumeService = {
    createResume: async (userId: string, payload: createResume) => {
        const existingResume = await prisma.resume.findUnique({
            where: {
                id: userId
            },
            select: {
                id: true
            }
        });

        if (existingResume) {
            throw new ApiError(httpStatus.CONFLICT, "Resume already exists.You can update it instead!.");
        };
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

        const resume = await prisma.resume.create({
            data: {
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
        return resume
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
            const existingExp = await prisma.education.findUnique({
                where: {
                    id: edu.id
                }
            });

            if (!existingExp) {
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
    }
}