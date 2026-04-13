import { SkillSource } from "@prisma/client";
import prisma from "../../lib/prisma";
import { CreateResumeProfilePayload, ResumeSkill } from "./resumeProfile.interface";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { upsertResumeEmbedding } from "../resume/resume.helper";
import { generateResumeProfileEmbedding } from "./resumeProfile.utils";

export const ResumeProfileService = {
    create: async (userId: string, payload: CreateResumeProfilePayload) => {
        const embedding = await generateResumeProfileEmbedding(payload);
        // upsert the profile
        const result = await prisma.resumeProfile.upsert({
            where: { userId },
            create: {
                name: payload.name,
                email: payload.email,
                phone: payload.phone,
                domain: payload.domain,
                subDomain: payload.subdomain,
                userId,
                location: payload.location,
                summary: payload.summary,
                totalExperienceYear: payload.totalExp,
                embedding,
                resumeSections: {
                    create: payload.sections.map(section => ({
                        sectionType: section.sectionType,
                        title: section.title,
                        orderIndex: section.orderIndex,
                        items: {
                            create: section.items.map(item => ({
                                orderIndex: item.orderIndex,
                                data: item.data
                            }))
                        }
                    }))
                }
            },
            update: {
                name: payload.name,
                email: payload.email,
                phone: payload.phone,
                domain: payload.domain,
                subDomain: payload.subdomain,
                location: payload.location,
                summary: payload.summary,
                totalExperienceYear: payload.totalExp,
                embedding,
                // delete old sections and recreate
                resumeSections: {
                    deleteMany: {},
                    create: payload.sections.map(section => ({
                        sectionType: section.sectionType,
                        title: section.title,
                        orderIndex: section.orderIndex,
                        items: {
                            create: section.items.map(item => ({
                                orderIndex: item.orderIndex,
                                data: item.data
                            }))
                        }
                    }))
                }
            },
            include: {
                resumeSections: {
                    include: { items: true }
                }
            }
        });

        // delete old skills and recreate
        if (payload.skills && payload.skills.length > 0) {
            await prisma.skill.deleteMany({
                where: { resumeProfileId: result.id }
            });

            await prisma.skill.createMany({
                data: payload.skills.flatMap((skill: ResumeSkill) =>
                    skill.Skills.map((s: string) => ({
                        skillCategory: skill.category,
                        skillName: s,
                        resumeProfileId: result.id,
                        source: SkillSource.RESUME
                    }))
                ),
            });
        }
        const res = await upsertResumeEmbedding(result.id, embedding);
        return res;
    },
    getMyResumeProfile: async (userId: string) => {
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        });

        if (!user) {
            throw new ApiError(httpStatus.NOT_FOUND, "User not found to get resume!")
        };

        const result = await prisma.resumeProfile.findUnique({
            where: {
                userId
            },
            select: {
                id: true,
                userId: true,
                domain: true,
                subDomain: true,
                name: true,
                email: true,
                location: true,
                phone: true,
                summary: true,
                totalExperienceYear: true,
                // embedding: true,
                createdAt: true,
                updatedAt: true,
                skills: {
                    select: {
                        id: true,
                        skillCategory: true,
                        skillName: true,
                        proficiencyLevel: true,
                        yearOfExperience: true,
                        source: true,
                        createdAt: true,
                        updatedAt: true
                    }
                },
                resumeSections: {
                    select: {
                        id: true,
                        sectionType: true,
                        title: true,
                        orderIndex: true,
                        createdAt: true,
                        updatedAt: true,
                        items: {
                            select: {
                                id: true,
                                orderIndex: true,
                                data: true,
                                createdAt: true,
                                updatedAt: true
                            }
                        }
                    }
                }
            }
        });
        return result
    },
    // Update section meta
    updateSection: async (sectionId: string, payload: { title?: string, orderIndex?: number, sectionType?: string }) => {
        const section = await prisma.resumeSection.findUnique({
            where: {
                id: sectionId
            }
        });
        if (!section) {
            throw new ApiError(httpStatus.NOT_FOUND, "Resume section not found!")
        }
        const result = await prisma.resumeSection.update({
            where: { id: sectionId },
            data: {
                title: payload.title,
                orderIndex: payload.orderIndex,
                sectionType: payload.sectionType
            }
        });
        return result
    },
    deleteSection: async (sectionId: string) => {
        const section = await prisma.resumeSection.findUnique({
            where: {
                id: sectionId
            }
        });
        if (!section) {
            throw new ApiError(httpStatus.NOT_FOUND, "Resume section not found!")
        }
        await prisma.resumeSection.delete({
            where: { id: sectionId },
        });
        return {
            message: "Section deleted!"
        }
    },

    // Update a single item's data
    updateSectionItem: async (itemId: string, data: Record<string, any>) => {
        const sectionItem = await prisma.resumeSectionItem.findUnique({
            where: {
                id: itemId
            }
        });
        if (!sectionItem) {
            throw new ApiError(httpStatus.NOT_FOUND, "Resume section item not found!")
        }
        const result = await prisma.resumeSectionItem.update({
            where: { id: itemId },
            data: {
                data: {
                    ...(sectionItem.data as object),
                    ...data
                }
            }
        });
        return result
    },
    deleteSectionItem: async (itemId: string) => {
        const sectionItem = await prisma.resumeSectionItem.findUnique({
            where: {
                id: itemId
            }
        });
        if (!sectionItem) {
            throw new ApiError(httpStatus.NOT_FOUND, "Resume section item not found!")
        }
        await prisma.resumeSectionItem.delete({
            where: { id: itemId },

        });
        return {
            message: "Item Deleted!"
        }
    }
}
