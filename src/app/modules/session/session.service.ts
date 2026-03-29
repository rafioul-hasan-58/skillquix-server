import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import prisma from "../../lib/prisma"
import { MentorshipRequestStatus, MentorshipSession, SessionStatus, UserRole } from "@prisma/client";
import { createMeetLink, oauth2Client } from "./session.utils";
import { google } from "googleapis";


export const getAuthUrl = async (userId: string) => {
    // Your getAuthUrl logic here
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            mentorProfile: true
        }
    });

    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "Admin not found to get auth url!")
    }

    if (!user.mentorProfile) {
        throw new ApiError(httpStatus.FORBIDDEN, "Only mentors can connect Google Calendar");
    }

    const scopes = [
        "https://www.googleapis.com/auth/calendar",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
    ];

    const url = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: scopes,
        prompt: "consent",
        state: userId,
    });

    return { authUrl: url };
};

export const SessionService = {
    // auth
    handleOAuthCallback: async (code: string, state: string) => {
        const userId = state;

        if (!userId) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Invalid state parameter");
        }

        let tokens;
        try {
            const result = await oauth2Client.getToken(code);
            tokens = result.tokens;
            oauth2Client.setCredentials(tokens);
        } catch (error: any) {
            if (error.message === 'invalid_grant' || error.response?.data?.error === 'invalid_grant') {
                throw new ApiError(
                    httpStatus.BAD_REQUEST,
                    'Google authorization expired or already used. Please try connecting your Google account again.'
                );
            }
            throw error;
        }

        if (!tokens.access_token) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Failed to get access token from Google");
        }
        if (!tokens.refresh_token) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Failed to get refresh token from Google");
        }

        // Get Google user info
        const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
        const { data } = await oauth2.userinfo.get();

        if (!data.email) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Failed to get user info from Google");
        }

        // Save or update Google credentials
        const mentorGoogleAuth = await prisma.mentorGoogleAuth.upsert({
            where: { userId },
            update: {
                accessToken: tokens.access_token,
                ...(tokens.refresh_token ? { refreshToken: tokens.refresh_token } : {}),
                tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
                googleId: data.id || undefined,
            },
            create: {
                userId,
                googleId: data.id || undefined,
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token || undefined,
                tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
            },
        });

        return mentorGoogleAuth;
    },
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
        payload: { sessionId: string, startDateTime: string; endDateTime: string; meetLink: string }
    ) => {
        const { startDateTime, endDateTime, meetLink, sessionId } = payload;

        const session = await prisma.mentorshipSession.findUnique({
            where: { id: sessionId },
            include: { request: true },
        });

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
        })
        const update = await prisma.mentorshipSession.update({
            where: { id: sessionId },
            data: {
                status: SessionStatus.UPCOMING,
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