import status from "http-status";
import ApiError from "../../errors/ApiError";
import prisma from "../../lib/prisma";
import QueryBuilder from "../../builder/QueryBuilder";
import { ActivityType, Gig, Source } from "@prisma/client";
import { generateGigEmbedding, upsertGigEmbedding } from "./gig.helper";
import config from "../../../config";
import { ActivityLogService } from "../activitylog/activitylog.service";

export const GigService = {
    // Create a new gig
    createGig: async (userId: string, payload: Gig) => {
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        });
        if (!user) {
            throw new ApiError(status.NOT_FOUND, "User not found to create gig!")
        }
        const embedding = await generateGigEmbedding({
            ...payload,
            validUntil: payload.validUntil instanceof Date ? payload.validUntil.toISOString() : payload.validUntil
        });
        const result = await prisma.gig.create({
            data: {
                industryName: payload.industryName,
                industryEmail: payload.industryEmail,
                gigTitle: payload.gigTitle,
                category: payload.category,
                embedding,
                source: payload.source,
                description: payload.description,
                gigType: payload.gigType,
                experienceLevel: payload.experienceLevel,
                duration: payload.duration,
                location: payload.location,
                jobDescription: payload.jobDescription,
                responsibilities: payload.responsibilities,
                benefits: payload.benefits,
                gigStatus: payload.gigStatus,
                validUntil: payload.validUntil,
                userId
            },
        });
        const res = await upsertGigEmbedding(result.id, embedding);
        return res
    },

    // Get all gigs with QueryBuilder
    getAllGigsFromDB: async (query: Record<string, unknown>) => {
        const gigQuery = new QueryBuilder(prisma.gig, query)
            .search(["gigTitle", "industryName", "location", "category"])
            .filter()
            .paginate()
            .select({
                id: true,
                gigTitle: true,
                industryName: true,
                industryEmail: true,
                category: true,
                description: true,
                gigType: true,
                source: true,
                experienceLevel: true,
                duration: true,
                location: true,
                gigStatus: true,
                validUntil: true,
                createdAt: true,
            });

        const [result, meta] = await Promise.all([
            gigQuery.execute(),
            gigQuery.countTotal(),
        ]);

        if (!result.length) {
            throw new ApiError(status.NOT_FOUND, "No gigs found!");
        }
        const manualGigs = await prisma.gig.count({
            where: {
                source: Source.MANUAL
            }
        });
        const importedGigs = await prisma.gig.count({
            where: {
                source: Source.IMPORTED
            }
        });
        const aiGeneratedGigs = await prisma.gig.count({
            where: {
                source: Source.AI_GENERATED
            }
        });
        const gigsCount = {
            manualGigs,
            importedGigs,
            aiGeneratedGigs
        }


        return {
            meta: { ...meta, ...gigsCount },
            data: result,
        };
    },

    // Get single gig by ID
    getSingleGigByIdFromDB: async (gigId: string) => {
        const gig = await prisma.gig.findUnique({
            where: { id: gigId },
        });
        if (!gig) {
            throw new ApiError(status.NOT_FOUND, "Gig not found!");
        }
        return gig;
    },

    // Update gig
    updateGig: async (
        gigId: string,
        payload: Partial<Gig> & {
            responsibilities?: string[];
            benefits?: string[];
            jobDescription?: string[];
        }
    ) => {
        const isGigExist = await prisma.gig.findUnique({
            where: { id: gigId },
        });

        if (!isGigExist) {
            throw new ApiError(status.NOT_FOUND, "Gig not found!");
        }

        const { responsibilities, benefits, jobDescription, ...restPayload } = payload;

        const updatedGig = await prisma.gig.update({
            where: { id: gigId },
            data: {
                ...restPayload,

                ...(responsibilities && {
                    responsibilities: {
                        set: [
                            ...new Set([
                                ...isGigExist.responsibilities,
                                ...responsibilities,
                            ]),
                        ],
                    },
                }),

                ...(benefits && {
                    benefits: {
                        set: [
                            ...new Set([
                                ...isGigExist.benefits,
                                ...benefits,
                            ]),
                        ],
                    },
                }),
                ...(jobDescription && {
                    jobDescription: {
                        set: [
                            ...new Set([
                                ...isGigExist.jobDescription,
                                ...jobDescription,
                            ]),
                        ],
                    },
                }),
            },
        });

        return updatedGig;
    },

    // Delete gig
    deleteGigFromDB: async (gigId: string) => {
        const isGigExist = await prisma.gig.findUnique({
            where: { id: gigId },
        });

        if (!isGigExist) {
            throw new ApiError(status.NOT_FOUND, "Gig not found!");
        }

        await prisma.gig.delete({
            where: { id: gigId },
        });
        const response = await fetch(
            `${config.ai_base_url}/v1/admin/qdrant-delete/${gigId}`,
            {
                method: "DELETE",
                headers: {
                    "accept": "application/json",
                },
            }
        );

        const data = await response.json();
        return data;
    },
    saveGig: async (gigId: string, userId: string) => {
        const [user, gig] = await Promise.all([
            prisma.user.findUnique({ where: { id: userId } }),
            prisma.gig.findUnique({ where: { id: gigId } }),
        ]);

        if (!user) throw new Error("User not found");
        if (!gig) throw new Error("Gig not found");

        // 2️. Create applied gig (duplicate handled by unique constraint)
        try {
            await prisma.savedGig.create({
                data: {
                    gigId,
                    userId,
                },
            });

            await ActivityLogService.add(userId, ActivityType.SAVED_GIG)

            return { saved: true }
        } catch (error: any) {
            if (error.code === "P2002") {
                throw new Error("You already applied to this gig");
            }
            throw error;
        }
    },
    applyGig: async (gigId: string, userId: string) => {
        // 1️. Check user & gig in parallel
        const [user, gig] = await Promise.all([
            prisma.user.findUnique({ where: { id: userId } }),
            prisma.gig.findUnique({ where: { id: gigId } }),
        ]);

        if (!user) {
            throw new Error("User not found");
        }

        if (!gig) {
            throw new Error("Gig not found");
        }

        // 2️. Create applied gig (duplicate handled by unique constraint)
        try {
            await prisma.appliedGig.create({
                data: {
                    gigId,
                    userId,
                },
            });

            await ActivityLogService.add(userId, ActivityType.APPLIED_GIG)

            return { applied: true }
        } catch (error: any) {
            if (error.code === "P2002") {
                throw new Error("You already applied to this gig");
            }
            throw error;
        }
    }
};
