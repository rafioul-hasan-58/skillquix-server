import status from "http-status";
import ApiError from "../../errors/ApiError";
import prisma from "../../lib/prisma";
import { CreateReflextionInput } from "./reflextion.validation";
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



        if (!Array.isArray(payload.extractedSkills) || payload.extractedSkills.length === 0) {
            throw new ApiError(status.BAD_REQUEST, "At least one extracted skill is required");
        }
        // You can add more business rules here if needed
        const reflextion = await prisma.reflextion.create({
            data: {
                userId,
                extractedSkills: payload.extractedSkills,
                impectBullects: payload.impectBullects ?? [],
                shortSummary: payload.shortSummary.trim(),
            },
        });
        return reflextion;
    },

    // GET ALL (with basic optional filtering + sorting)
    getAllReflextions: async (query: Record<string, unknown>) => {
        const reflextionQuery = new QueryBuilder(prisma.reflextion, query)
            .search(["extractedSkills", "shortSummary"])
            .filter()
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
            .search(["extractedSkills", "shortSummary"])
            .filter()
            .rawFilter({ userId })
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
        });

        if (!reflextion) {
            throw new ApiError(status.NOT_FOUND, "Reflextion not found");
        }

        return reflextion;
    },

    updateReflextion: async (
        id: string,
        payload: Partial<{
            extractedSkills: string[];
            impectBullects: string[];
            shortSummary: string;
        }>,
    ) => {
        // Fetch existing record
        const existing = await prisma.reflextion.findUnique({ where: { id } });
        if (!existing) {
            throw new ApiError(status.NOT_FOUND, "Reflextion not found");
        }

        // Combine impectBullects if payload contains new ones
        let combinedImpectBullects = existing.impectBullects || [];
        if (payload.impectBullects?.length) {
            combinedImpectBullects = Array.from(new Set([
                ...combinedImpectBullects,
                ...payload.impectBullects
            ]));
        }
        // Combine Skills if payload contains new ones
        let combinedExtractedSkills = existing.extractedSkills || [];
        if (payload.extractedSkills?.length) {
            combinedExtractedSkills = Array.from(new Set([
                ...combinedExtractedSkills,
                ...payload.extractedSkills
            ]));
        }
        // Prepare update object
        const dataToUpdate: any = {
            ...payload,
            impectBullects: combinedImpectBullects,
            extractedSkills: combinedExtractedSkills
        };

        // Update in DB
        const updated = await prisma.reflextion.update({
            where: { id },
            data: {
                ...payload,
                impectBullects: combinedImpectBullects,
                extractedSkills: combinedExtractedSkills
            },
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