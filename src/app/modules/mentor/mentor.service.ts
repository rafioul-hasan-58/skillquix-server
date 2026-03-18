import { MentorProfile, MentorshipRequest, MentorshipRequestStatus } from "@prisma/client";
import prisma from "../../lib/prisma";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import QueryBuilder from "../../builder/QueryBuilder";
import { generateMentorshipEmbedding, upsertMentorEmbedding } from "./mentor.utils";

export const MentorService = {
    // mentor
    setupMentorProfile: async (userId: string, payload: MentorProfile) => {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new ApiError(httpStatus.NOT_FOUND, "User not found to setup mentor profile!");
        }

        return await prisma.$transaction(async (tx) => {
            try {
                // Step 1: Generate embedding
                const embedding = await generateMentorshipEmbedding(payload.mentorshipDetails, payload.skills);
                if (!embedding || embedding.success === false) {
                    throw new ApiError(httpStatus.BAD_REQUEST, "Failed to generate mentorship embedding");
                }

                // Step 2: Create mentor profile
                const result = await tx.mentorProfile.create({
                    data: {
                        ...payload,
                        userId,
                    },
                });

                // Step 3: Upsert embedding
                const res = await upsertMentorEmbedding(result.id, embedding);

                return res;
            } catch (err: any) {
                if (err instanceof PrismaClientKnownRequestError && err.code === "P2002") {
                    throw new ApiError(httpStatus.CONFLICT, "A mentor profile already exists for this user.");
                }
                throw err; // transaction will rollback automatically
            }
        });
    },
    // mentor
    updateMentorProfile: async (userId: string, payload: Partial<MentorProfile>) => {
        const mentorProfile = await prisma.mentorProfile.findUnique({ where: { userId } });
        if (!mentorProfile) {
            throw new ApiError(httpStatus.NOT_FOUND, "Mentor profile not found!");
        }
        // Step 2: Update mentor profile
        const updated = await prisma.mentorProfile.update({
            where: { userId },
            data: {
                ...payload,
            },
        });

        return updated;

    },
    // mentor
    getMyRequests: async (mentorId: string, query: Record<string, unknown>) => {
        const mentor = await prisma.user.findUnique({
            where: {
                id: mentorId
            },
            include: {
                mentorProfile: true
            }
        });
        console.log(mentor)
        if (!mentor?.mentorProfile) {
            throw new ApiError(httpStatus.NOT_FOUND, "No mentor found!setup your mentor profile first!")
        };
        const userQuery = new QueryBuilder(prisma.mentorshipRequest, query)
            .filter()
            .rawFilter({ mentorId })
            .paginate()
            .select({
                id: true,
                learningGoals: true,
                actionItems: true,
                status: true,
                mentee: {
                    select: {
                        id: true,
                        fullName: true,
                        profession: true,
                        profileImage: true
                    }
                }
            })

        const [data, meta] = await Promise.all([
            userQuery.execute(),
            userQuery.countTotal(),
        ]);
        return {
            data,
            meta
        }
    },
    // mentor
    acceptMentorshipRequest: async (requestId: string) => {
        const request = await prisma.mentorshipRequest.findUnique({
            where: {
                id: requestId
            }
        });
        if (!request) {
            throw new ApiError(httpStatus.NOT_FOUND, "Mentorship request Not found!")
        }
        const result = await prisma.mentorshipRequest.update({
            where: {
                id: requestId
            },
            data: {
                status: MentorshipRequestStatus.ACCEPTED
            }
        });
        return {
            message: "Request accepted!"
        }
    },
    // mentor
    rejectMentorshipRequest: async (requestId: string) => {
        const request = await prisma.mentorshipRequest.findUnique({
            where: {
                id: requestId
            }
        });
        if (!request) {
            throw new ApiError(httpStatus.NOT_FOUND, "Mentorship request Not found!")
        }
        await prisma.mentorshipRequest.update({
            where: {
                id: requestId
            },
            data: {
                status: MentorshipRequestStatus.REJECTED
            }
        });
        return {
            message: "Request rejected!"
        }
    },

    // mentee
    sendMentorshipRequest: async (menteeId: string, payload: MentorshipRequest) => {
        const mentee = await prisma.user.findUnique({
            where: {
                id: menteeId
            }
        });
        if (!mentee) {
            throw new ApiError(httpStatus.NOT_FOUND, "Mentee not found to send mentorship request!");
        };
        const mentor = await prisma.user.findUnique({
            where: {
                id: payload.mentorId
            },
            include: {
                mentorProfile: true
            }
        });
        if (!mentor?.mentorProfile) {
            throw new ApiError(httpStatus.NOT_FOUND, "Provide a valid mentor!")
        }
        const result = await prisma.mentorshipRequest.create({
            data: {
                menteeId,
                mentorId: payload.mentorId,
                actionItems: payload.actionItems,
                learningGoals: payload.learningGoals
            }
        });
        return result
    },
    // mentee
    myMentors: async (menteeId: string) => {
        const mentee = await prisma.user.findUnique({
            where: {
                id: menteeId
            }
        });
        if (!mentee) {
            throw new ApiError(httpStatus.NOT_FOUND, "Mentee not found!")
        };
        const result = await prisma.mentorshipRequest.findMany({
            where: {
                menteeId
            },
            select: {
                id: true,
                status: true,
                mentor: {
                    select: {
                        mentorProfile: {
                            select: {
                                id: true,
                                mentorName: true,
                                role: true,
                            }
                        }
                    }
                }
            }
        });
        return result
    },
    // admin
    getPendingMentors: async () => {
        const result = await prisma.mentorProfile.findMany({
            where: {
                isApproved: false
            },
            select: {
                id: true,
                mentorName: true,
                role: true,
                company: true,
                experienceYears: true,
                isApproved: true,
                user: {
                    select: {
                        id: true,
                        profileImage: true
                    }
                }
            }
        });
        return result
    },

    // admin
    approveMentor: async (mentorId: string) => {
        const mentor = await prisma.mentorProfile.findUnique({
            where: {
                id: mentorId
            },
        });
        if (!mentor) {
            throw new ApiError(httpStatus.NOT_FOUND, "Mentor profile is not setted up yet!");
        };

        if (mentor.isApproved) {
            throw new ApiError(httpStatus.NOT_ACCEPTABLE, "Mentor already approved!")
        }

        await prisma.mentorProfile.update({
            where: {
                id: mentorId
            },
            data: {
                isApproved: true
            }
        });

        return {
            message: "Mentor approved successfully!"
        }
    },
    // mentor
    activateMentorProfile: async (userId: string) => {
        const mentorProfile = await prisma.mentorProfile.findUnique({ where: { userId } });
        if (!mentorProfile) {
            throw new ApiError(httpStatus.NOT_FOUND, "Mentor profile not found!");
        }
        if (mentorProfile.isActive) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Mentor profile is already active!");
        }
        await prisma.mentorProfile.update({
            where: { userId },
            data: { isActive: true },
        });
        return {
            message: "Profile activated!"
        }
    },

    deactivateMentorProfile: async (userId: string) => {
        const mentorProfile = await prisma.mentorProfile.findUnique({ where: { userId } });
        if (!mentorProfile) {
            throw new ApiError(httpStatus.NOT_FOUND, "Mentor profile not found!");
        }
        if (!mentorProfile.isActive) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Mentor profile is already inactive!");
        }

        await prisma.mentorProfile.update({
            where: { userId },
            data: { isActive: false },
        });
        return {
            message: "Profile deactivated!"
        }
    },
}