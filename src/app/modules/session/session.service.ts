import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import prisma from "../../lib/prisma"
import { MentorshipRequestStatus, MentorshipSession, SessionStatus } from "@prisma/client";






export const SessionService = {
    // auth
    // mentee
    sendSessionRequest: async (requestId: string, payload: MentorshipSession) => {
        const { actionItems, menteeRequestNote } = payload;
        const request = await prisma.mentorshipRequest.findUnique({
            where: {
                id: requestId
            }
        });
        if (!request) {
            throw new ApiError(httpStatus.NOT_FOUND, "Mentorship Request not found!");
        };
        if (request.status === MentorshipRequestStatus.PENDING) {
            throw new ApiError(httpStatus.NOT_ACCEPTABLE, "This request is pending!wait for mentor approval!");
        };
        // Check if there is already a pending session for this request
        const existingPending = await prisma.mentorshipSession.findFirst({
            where: {
                requestId,
                status: SessionStatus.PENDING
            }
        });

        if (existingPending) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                "A pending mentorship session already exists for this request."
            );
        }

        if (request.status === MentorshipRequestStatus.COMPLETED) {
            throw new ApiError(httpStatus.CONFLICT, "This mentorship already completed!")
        }
        const result = await prisma.mentorshipSession.create({
            data: {
                menteeRequestNote,
                actionItems,
                requestId
            },
            select: {
                id: true,
                requestId: true,
                actionItems: true,
                status: true,
                createdAt: true,
                updatedAt: true
            }
        });
        return result
    },
    // mentor
    acceptSessionRequest: async (
        payload: { sessionId: string, startDateTime: string; endDateTime: string; meetLink: string, topic?: string }
    ) => {
        const { startDateTime, endDateTime, meetLink, sessionId } = payload;

        const session = await prisma.mentorshipSession.findUnique({
            where: { id: sessionId },
            include: {
                request: {
                    include: {
                        mentorshipCompletion: true
                    }
                }
            },
        });

        if (session?.request?.mentorshipCompletion) {
            throw new ApiError(httpStatus.CONFLICT, `You cannot accept the request now! completion state is${session.request.mentorshipCompletion.status}`)
        }

        if (!session) {
            throw new ApiError(httpStatus.NOT_FOUND, "Mentorship session not found!");
        }
        await prisma.mentorshipRequest.update({
            where: {
                id: session.requestId
            },
            data: {
                status: MentorshipRequestStatus.ACTIVE
            }
        });
        const update = await prisma.mentorshipSession.update({
            where: { id: sessionId },
            data: {
                status: SessionStatus.UPCOMING,
                topic: payload.topic ?? "",
                startDateTime,
                endDateTime,
                meetLink, // use directly from payload
            },
        });

        // update last response to request (mentor action)
        await prisma.mentorProfile.update({
            where: { userId: session.request.mentorId },
            data: { lastResponseToRequest: new Date() }
        });

        return update;
    },
    // mentor
    declineSessionRequest: async (
        payload: { declineReason: string; sessionId: string }
    ) => {
        const { declineReason, sessionId } = payload;

        const session = await prisma.mentorshipSession.findUnique({
            where: { id: sessionId },
            // include only if you really need request data
        });

        if (!session) {
            throw new ApiError(httpStatus.NOT_FOUND, "Mentorship session not found!");
        }


        // ✅ Update session status and decline reason
        const update = await prisma.mentorshipSession.update({
            where: { id: sessionId },
            data: {
                status: SessionStatus.REJECTED,
                declineReason,
            },
            include: { request: true }
        });

        // update last response to request (mentor action)
        await prisma.mentorProfile.update({
            where: { userId: update.request.mentorId },
            data: { lastResponseToRequest: new Date() }
        });

        return {
            message: "Session declined!"
        }
    },
    // mentor
    sessionDetails: async (sessionId: string) => {
        const request = await prisma.mentorshipRequest.findUnique({
            where: {
                id: sessionId
            },
            select: {
                id: true,
                mentee: {
                    select: {
                        id: true,
                        fullName: true,
                        profession: true,
                    }
                },
                status: true,
                learningGoals: true,
                actionItems: true,
                mentorshipSessions: true
            }

        });

        if (!request) {
            throw new ApiError(httpStatus.NOT_FOUND, "Mentorship request not found!");
        };

        return request

    }

}