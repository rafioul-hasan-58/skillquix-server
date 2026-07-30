import { SkillSource } from "@prisma/client";
import prisma from "../../lib/prisma";
import { CreateResumeProfilePayload, ResumeSkill } from "./resumeProfile.interface";
import ApiError from "../../app/errors/ApiError";
import httpStatus from "http-status";
import { generateResumeProfileEmbedding } from "./resumeProfile.halper";
import { resumeEmbeddingQueue } from "../../infrastructure/queue/queues/resume.queue";
import { JOB_NAMES } from "../../infrastructure/queue/queue.constant";

const create = async (userId: string, payload: CreateResumeProfilePayload) => {
    const embedding = await generateResumeProfileEmbedding(payload);
    // Run resume upsert and skill operations in parallel
    const [result, masterCvSkills] = await Promise.all([
        // 1. upsert the profile
        prisma.resumeProfile.upsert({
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
                },

            },
            include: {
                resumeSections: {
                    include: { items: true }
                }
            }
        }),

        // 2. handle skills in parallel
        (async () => {
            if (!payload.skills?.length) return [];
            await prisma.skill.deleteMany({ where: { userId, source: SkillSource.RESUME } });

            // Flatten and deduplicate skills
            const flatSkills = payload.skills.flatMap((skill: ResumeSkill) =>
                skill.Skills.map((s: string) => ({
                    skillCategory: skill.category,
                    skillName: s,
                }))
            );

            const uniqueSkillsMap = new Map<string, typeof flatSkills[number]>();
            for (const skill of flatSkills) {
                uniqueSkillsMap.set(skill.skillName, skill);
            }
            const uniqueSkills = Array.from(uniqueSkillsMap.values());

            for (const skill of uniqueSkills) {
                await prisma.skill.upsert({
                    where: {
                        userId_skillName: {
                            userId,
                            skillName: skill.skillName,
                        },
                    },
                    update: {
                        skillCategory: skill.skillCategory,
                        source: SkillSource.RESUME,
                    },
                    create: {
                        skillName: skill.skillName,
                        skillCategory: skill.skillCategory,
                        userId,
                        source: SkillSource.RESUME,
                    },
                });
            }

            return prisma.skill.findMany({ where: { userId, source: SkillSource.RESUME } });
        })()
    ]);

    // 3. upsert MasterCv + add to queue in parallel
    await Promise.all([
        prisma.masterCv.upsert({
            where: { userId },
            create: {
                userId,
                fullName: payload.name,
                email: payload.email,
                phoneNumber: payload.phone,
                location: payload.location,
                resumeSummary: payload.summary,
                totalExperienceYear: payload.totalExp,
                skills: masterCvSkills,
            },
            update: {
                fullName: payload.name,
                email: payload.email,
                phoneNumber: payload.phone,
                location: payload.location,
                resumeSummary: payload.summary,
                totalExperienceYear: payload.totalExp,
                skills: masterCvSkills,
                version: { increment: 1 }

            },
        }),

        resumeEmbeddingQueue.add(
            JOB_NAMES.RESUME.EXTRACT_AND_EMBED,
            { resumeProfileId: result.id, embedding },
            { attempts: 3, backoff: { type: "exponential", delay: 2000 } }
        )
    ]);

    return { message: "Resume parsed and skills extracted successfully!" };
};
const getMyResumeProfile = async (userId: string) => {
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

    // Fetch resume-sourced skills separately via userId
    const skills = await prisma.skill.findMany({
        where: { userId, source: SkillSource.RESUME },
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
    });

    return result ? { ...result, skills } : null
};

// Update section meta
const updateSection = async (sectionId: string, payload: { title?: string, orderIndex?: number, sectionType?: string }) => {
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
};

const deleteSection = async (sectionId: string) => {
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
};

// Update a single item's data
const updateSectionItem = async (itemId: string, data: Record<string, any>) => {
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
};

const deleteSectionItem = async (itemId: string) => {
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
};

export const ResumeProfileService = {
    create,
    getMyResumeProfile,
    updateSection,
    deleteSection,
    updateSectionItem,
    deleteSectionItem
}
