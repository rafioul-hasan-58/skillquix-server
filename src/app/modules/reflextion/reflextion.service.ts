import status from "http-status";
import ApiError from "../../errors/ApiError";
import prisma from "../../lib/prisma";
import { CreateReflextionInput, UpdateReflextionInput } from "./reflextion.validation";
import QueryBuilder from "../../builder/QueryBuilder";
import httpStatus from "http-status";
import { SubscriptionType } from "@prisma/client";

export const ReflextionService = {
    // CREATE
    createReflextion: async (userId: string, payload: CreateReflextionInput) => {
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
        // You can add more business rules here if needed
        const reflextion = await prisma.reflextion.create({
            data: {
                userId,
                extractedSkills: {
                    create: payload.extractedSkills.map(skill => ({
                        skillName: skill.skillName,
                        skillCategory: skill.skillCategory,
                        proficiencyLevel: skill.proficiencyLevel,
                        yearOfExperience: skill.yearOfExperience,
                        userId: userId,
                    }))
                },
                impectBullects: payload.impectBullects ?? [],
                shortSummary: payload.shortSummary.trim(),
            },
            include: {
                extractedSkills: true
            }
        });
        return reflextion;
    },

    // GET ALL (with basic optional filtering + sorting)
    getAllReflextions: async (query: Record<string, unknown>) => {
        const reflextionQuery = new QueryBuilder(prisma.reflextion, query)
            .search(["extractedSkills.some.skillName", "shortSummary"])
            .filter()
            .include({ extractedSkills: true })
            .paginate();

        const [data, meta] = await Promise.all([
            reflextionQuery.execute(),
            reflextionQuery.countTotal(),
        ]);
        return {
            meta,
            data,
        };

    },
    getMyReflextions: async (userId: string, query: Record<string, unknown>) => {
        const reflextionQuery = new QueryBuilder(prisma.reflextion, query)
            .search(["extractedSkills.some.skillName", "shortSummary"])
            .filter()
            .rawFilter({ userId })
            .include({ extractedSkills: true })
            .paginate();

        const [data, meta] = await Promise.all([
            reflextionQuery.execute(),
            reflextionQuery.countTotal(),
        ]);
        return {
            meta,
            data,
        };

    },
    // GET ONE
    getReflextionById: async (id: string) => {
        const reflextion = await prisma.reflextion.findUnique({
            where: { id },
            include: { extractedSkills: true }
        });

        if (!reflextion) {
            throw new ApiError(status.NOT_FOUND, "Reflextion not found");
        }

        return reflextion;
    },

    updateReflextion: async (
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
        if (payload.extractedSkills !== undefined) {
            updateData.extractedSkills = {
                deleteMany: {},
                create: payload.extractedSkills.map(skill => ({
                    skillName: skill.skillName,
                    skillCategory: skill.skillCategory,
                    proficiencyLevel: skill.proficiencyLevel,
                    yearOfExperience: skill.yearOfExperience,
                    userId: existing.userId,
                }))
            };
        }

        // Update in DB
        const updated = await prisma.reflextion.update({
            where: { id },
            data: updateData,
            include: { extractedSkills: true }
        });
        return updated;
    },

    // DELETE
    deleteReflextion: async (id: string) => {
        const existing = await prisma.reflextion.findUnique({
            where: { id },
        });

        if (!existing) {
            throw new ApiError(status.NOT_FOUND, "Reflextion not found");
        }

        await prisma.reflextion.delete({
            where: { id },
        });

        return { message: "Reflextion deleted successfully" };
    },
};

export default ReflextionService;