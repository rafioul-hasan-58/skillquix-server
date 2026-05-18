import status from "http-status";
import ApiError from "../../app/errors/ApiError";
import prisma from "../../lib/prisma";
import { Accomplishment } from "@prisma/client";

// Create new accomplishment
const createAccomplishment = async (data: Accomplishment) => {
    const { title, description, date, userId } = data;

    const accomplishment = await prisma.accomplishment.create({
        data: {
            title,
            description,
            date: new Date(date),
            userId
        },
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    profileImage: true,
                },
            },
        },
    });

    return accomplishment;
};

// Get all accomplishments (maybe filtered by user later)
const getAllAccomplishments = async (userId?: string) => {
    const where = userId ? { userId } : {};

    const accomplishments = await prisma.accomplishment.findMany({
        where,
        orderBy: [
            { date: "desc" },
            { createdAt: "desc" },
        ],
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    profileImage: true,
                },
            },
        },
    });

    return accomplishments;
};

// Get single accomplishment by ID
const getAccomplishmentById = async (id: string, userId?: string) => {
    const accomplishment = await prisma.accomplishment.findUnique({
        where: { id },
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    profileImage: true,
                },
            },
        },
    });

    if (!accomplishment) {
        throw new ApiError(status.NOT_FOUND, "Accomplishment not found");
    }

    return accomplishment;
};

// Update accomplishment
const updateAccomplishment = async (
    id: string,
    data: Partial<Accomplishment>,
    userId: string // to check ownership
) => {
    const accomplishment = await prisma.accomplishment.findUnique({
        where: { id },
    });

    if (!accomplishment) {
        throw new ApiError(status.NOT_FOUND, "Accomplishment not found");
    }

    if (accomplishment.userId !== userId) {
        throw new ApiError(status.FORBIDDEN, "You can only update your own accomplishments");
    }

    const updated = await prisma.accomplishment.update({
        where: { id },
        data: {
            title: data.title,
            description: data.description,
            date: data.date ? new Date(data.date) : undefined,
        },
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    profileImage: true,
                },
            },
        },
    });

    return updated;
};

// Delete accomplishment
const deleteAccomplishment = async (id: string, userId: string) => {
    const accomplishment = await prisma.accomplishment.findUnique({
        where: { id },
    });

    if (!accomplishment) {
        throw new ApiError(status.NOT_FOUND, "Accomplishment not found");
    }

    if (accomplishment.userId !== userId) {
        throw new ApiError(status.FORBIDDEN, "You can only delete your own accomplishments");
    }

    await prisma.accomplishment.delete({
        where: { id },
    });

    return { message: "Accomplishment deleted successfully" };
};

export const AccomplishmentService = {
    createAccomplishment,
    getAllAccomplishments,
    getAccomplishmentById,
    updateAccomplishment,
    deleteAccomplishment,
};