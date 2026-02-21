import status from "http-status";
import ApiError from "../../errors/ApiError";
import prisma from "../../lib/prisma";
import QueryBuilder from "../../builder/QueryBuilder";
import { Gig } from "@prisma/client";

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
        const result = await prisma.gig.create({
            data: {
                industryName: payload.industryName,
                industryEmail: payload.industryEmail,
                gigTitle: payload.gigTitle,
                category: payload.category,
                source: payload.source,
                description: payload.description,
                gigType: payload.gigType,
                exparienceLevel: payload.exparienceLevel,
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
        return result;
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
                exparienceLevel: true,
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

        return {
            meta,
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
    updateGig: async (gigId: string, payload: Partial<Gig>) => {
        const isGigExist = await prisma.gig.findUnique({
            where: { id: gigId },
        });

        if (!isGigExist) {
            throw new ApiError(status.NOT_FOUND, "Gig not found!");
        }

        const updatedGig = await prisma.gig.update({
            where: { id: gigId },
            data: payload,
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

        return null;
    },
};
