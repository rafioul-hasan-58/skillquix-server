import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import prisma from "../../lib/prisma"
import { MentorshipSession, UserRole } from "@prisma/client";
import { oauth2Client } from "./session.utils";
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

        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        if (!tokens.access_token) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Failed to get access token from Google");
        }
        if (!tokens.refresh_token) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Failed to get access token from Google");
        }

        // Get Google user info
        const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
        const { data } = await oauth2.userinfo.get();

        if (!data.email) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Failed to get user info from Google");
        }

        // Save or update Google credentials directly on User
        const mentorGoogleAuth = await prisma.mentorGoogleAuth.upsert({
            where: { id: userId },
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

        return mentorGoogleAuth
    },
    // mentee
    sendSessionRequest: async (requestId: string, payload: MentorshipSession) => {
        const { topic, preferredTime, actionItems } = payload;
        const request = await prisma.mentorshipRequest.findUnique({
            where: {
                id: requestId
            }
        });
        if (!request) {
            throw new ApiError(httpStatus.NOT_FOUND, "Mentorship Request not found!");
        };
        // Check if there is already a pending session for this request
        const existingPending = await prisma.mentorshipSession.findFirst({
            where: {
                requestId,
                status: "PENDING" // adjust to match your enum/string value
            }
        });

        if (existingPending) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                "A pending mentorship session already exists for this request."
            );
        }
        const result = await prisma.mentorshipSession.create({
            data: {
                preferredTime,
                topic,
                actionItems,
                requestId
            },
            select: {
                id: true,
                requestId: true,
                preferredTime: true,
                actionItems: true,
                status: true,
                createdAt: true,
                updatedAt: true
            }
        });
        return result
    },
    // mentor
    acceptSessionRequest: async () => {

    }

}