import status from "http-status";
import ApiError from "../../app/errors/ApiError";
import prisma from "../../lib/prisma";
import { CreateReflextionInput, UpdateReflextionInput } from "./reflextion.validation";
import QueryBuilder from "../../infrastructure/builder/QueryBuilder";
import httpStatus from "http-status";
import { SkillSource, SubscriptionType } from "@prisma/client";

// CREATE
const createReflextion = async (userId: string, payload: CreateReflextionInput) => {
    if (!payload.shortSummary?.trim()) {
        throw new ApiError(status.BAD_REQUEST, "Short summary is required");
    }
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    });
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "User is not found to create reflextion!")
    };

    if (user.subscriptionType === SubscriptionType.FREE) {
        const reflextionCount = await prisma.reflextion.count({
            where: {
                userId
            }
        });
        if (reflextionCount >= 3) {
            throw new ApiError(httpStatus.FORBIDDEN, "Free users can create only 3 reflections")
        }
    }
    if (user.subscriptionType === SubscriptionType.PRO) {
        const reflextionCount = await prisma.reflextion.count({
            where: {
                userId
            }
        });
        if (reflextionCount >= 50) {
            throw new ApiError(httpStatus.FORBIDDEN, "Pro users can create only 50 reflections")
        }
    }
    if (user.subscriptionType === SubscriptionType.PREMIUM) {
        const reflextionCount = await prisma.reflextion.count({
            where: {
                userId
            }
        });
        if (reflextionCount >= 100) {
            throw new ApiError(httpStatus.FORBIDDEN, "Premium users can create only 100 reflections")
        }
    }




    if (!Array.isArray(payload.extractedSkills) || payload.extractedSkills.length === 0) {
        throw new ApiError(status.BAD_REQUEST, "At least one extracted skill is required");
    }

    // Create the reflextion
    const reflextion = await prisma.reflextion.create({
        data: {
            userId,
            impectBullects: payload.impectBullects ?? [],
            shortSummary: payload.shortSummary.trim(),
        }
    });
    // Create skills with reflextionId for per-reflextion tracking
    await prisma.skill.createMany({
        data: payload.extractedSkills.map(skill => ({
            skillName: skill.skillName,
            skillCategory: skill.skillCategory,
            proficiencyLevel: skill.proficiencyLevel,
            yearOfExperience: skill.yearOfExperience,
            userId,
            reflextionId: reflextion.id,
            source: SkillSource.REFLEXTION
        }))
    });

    const extractedSkills = await prisma.skill.findMany({
        where: { reflextionId: reflextion.id }
    });

    const existMasterCv = await prisma.masterCv.findUnique({
        where: {
            userId
        }
    });

    await prisma.masterCv.upsert({
        where: { userId },
        create: {
            userId,
            skills: extractedSkills,
            refletions: [reflextion]
        },
        update: {
            skills: [
                ...(existMasterCv?.skills as any[] ?? []),
                ...extractedSkills
            ],
            refletions: [
                ...(existMasterCv?.refletions as any[] ?? []),
                reflextion
            ],
        }
    });
    return { ...reflextion, extractedSkills };
};

// GET ALL (with basic optional filtering + sorting)
const getAllReflextions = async (query: Record<string, unknown>) => {
    const reflextionQuery = new QueryBuilder(prisma.reflextion, query)
        .search(["shortSummary"])
        .filter()
        .paginate();

    const [rawData, meta] = await Promise.all([
        reflextionQuery.execute(),
        reflextionQuery.countTotal(),
    ]);

    // Attach extractedSkills to each reflextion
    const data = await Promise.all(
        rawData.map(async (reflextion: any) => {
            const extractedSkills = await prisma.skill.findMany({
                where: { reflextionId: reflextion.id }
            });
            return { ...reflextion, extractedSkills };
        })
    );

    return {
        meta,
        data,
    };

};

const getMyReflextions = async (userId: string, query: Record<string, unknown>) => {
    const reflextionQuery = new QueryBuilder(prisma.reflextion, query)
        .search(["shortSummary"])
        .filter()
        .rawFilter({ userId })
        .paginate();

    const [rawData, meta] = await Promise.all([
        reflextionQuery.execute(),
        reflextionQuery.countTotal(),
    ]);

    // Attach extractedSkills to each reflextion
    const data = await Promise.all(
        rawData.map(async (reflextion: any) => {
            const extractedSkills = await prisma.skill.findMany({
                where: { reflextionId: reflextion.id }
            });
            return { ...reflextion, extractedSkills };
        })
    );

    return {
        meta,
        data,
    };

};

// GET ONE
const getReflextionById = async (id: string) => {
    const reflextion = await prisma.reflextion.findUnique({
        where: { id }
    });

    if (!reflextion) {
        throw new ApiError(status.NOT_FOUND, "Reflextion not found");
    }

    // Fetch skills linked to this specific reflextion
    const extractedSkills = await prisma.skill.findMany({
        where: { reflextionId: reflextion.id }
    });

    return { ...reflextion, extractedSkills };
};

const updateReflextion = async (
    id: string,
    payload: UpdateReflextionInput,
) => {
    // Fetch existing record
    const existing = await prisma.reflextion.findUnique({ where: { id } });
    if (!existing) {
        throw new ApiError(status.NOT_FOUND, "Reflextion not found");
    }

    const updateData: any = {};
    if (payload.impectBullects !== undefined) {
        updateData.impectBullects = payload.impectBullects;
    }
    if (payload.shortSummary !== undefined) {
        updateData.shortSummary = payload.shortSummary;
    }

    // Update reflextion
    const updated = await prisma.reflextion.update({
        where: { id },
        data: updateData
    });

    // If skills are provided, delete old skills for THIS reflextion and recreate
    if (payload.extractedSkills !== undefined) {
        await prisma.skill.deleteMany({
            where: { reflextionId: id }
        });

        await prisma.skill.createMany({
            data: payload.extractedSkills.map(skill => ({
                skillName: skill.skillName,
                skillCategory: skill.skillCategory,
                proficiencyLevel: skill.proficiencyLevel,
                yearOfExperience: skill.yearOfExperience,
                userId: existing.userId,
                reflextionId: id,
                source: SkillSource.REFLEXTION
            }))
        });
    }

    const extractedSkills = await prisma.skill.findMany({
        where: { reflextionId: id }
    });

    return { ...updated, extractedSkills };
};

// DELETE
const deleteReflextion = async (id: string) => {
    const existing = await prisma.reflextion.findUnique({
        where: { id },
    });

    if (!existing) {
        throw new ApiError(status.NOT_FOUND, "Reflextion not found");
    }

    // Delete skills linked to this reflextion first
    await prisma.skill.deleteMany({
        where: { reflextionId: id }
    });

    await prisma.reflextion.delete({
        where: { id },
    });

    return { message: "Reflextion deleted successfully" };
};

export const ReflextionService = {
    createReflextion,
    getAllReflextions,
    getMyReflextions,
    getReflextionById,
    updateReflextion,
    deleteReflextion,
};

export default ReflextionService;