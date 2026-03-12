import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import { google } from "googleapis";
import config from "../../../config";
import prisma from "../../lib/prisma";
import { getAuthUrl } from "./session.service";

export const oauth2Client = new google.auth.OAuth2(
  config.google_oauth.client_id,
  config.google_oauth.client_secret,
  config.google_oauth.redirect_url,
);

export const refreshAccessToken = async (googleAdmin: any) => {
  if (!googleAdmin.refreshToken) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "No refresh token available. Please re-authenticate.");
  }

  oauth2Client.setCredentials({
    refresh_token: googleAdmin.refreshToken,
  });

  const { credentials } = await oauth2Client.refreshAccessToken();

  if (!credentials.access_token) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Failed to refresh access token.");
  }

  // Update tokens in database
  await prisma.mentorGoogleAuth.update({
    where: { userId: googleAdmin.userId },
    data: {
      accessToken: credentials.access_token,
      tokenExpiry: credentials.expiry_date ? new Date(credentials.expiry_date) : undefined,
    },
  });

  return credentials.access_token;
};

// Helper: Get Valid Access Token
export const getValidAccessToken = async (googleAdmin: any) => {
  const now = new Date();
  // Check if token is expired or about to expire (5 min buffer)
  if (googleAdmin.tokenExpiry && new Date(googleAdmin.tokenExpiry).getTime() - now.getTime() < 5 * 60 * 1000) {
    return await refreshAccessToken(googleAdmin);
  }

  return googleAdmin.accessToken;
};
// create meet link
export const createMeetLink = async (payload: {
  startDate: string;
  endDate: string;
  topic: string;
  mentorId: string;
  menteeId: string;
}) => {
  const { topic, startDate, endDate, mentorId, menteeId } = payload;
  // find mentor
  const mentor = await prisma.user.findUnique({
    where: {
      id: mentorId
    },
    include: {
      mentorGoogleAuth: true
    }
  });
  const mentee = await prisma.user.findUnique({
    where: {
      id: menteeId
    }
  });
  if (!mentee) {
    throw new ApiError(httpStatus.NOT_FOUND, "Mentee not found!")
  }
  if (!mentor) {
    throw new ApiError(httpStatus.NOT_FOUND, "Mentor not found!")
  }
  if (!mentor?.mentorGoogleAuth) {
    throw new ApiError(httpStatus.NOT_FOUND, "Mentor auth credentials not found!")
  }

  const googleAdmin = mentor.mentorGoogleAuth;

  if (!googleAdmin.refreshToken) {
    const { authUrl } = await getAuthUrl(mentorId)
    return {
      statusCode: httpStatus.PERMANENT_REDIRECT,
      message: "Please verify for using google calendar",
      redirectTo: "verify auth",
      authUrl,
    };
  }

  // Get valid access token
  const accessToken = await getValidAccessToken(googleAdmin);

  // Set credentials for this request
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: googleAdmin.refreshToken,
  });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });
  const startDateTime = new Date(startDate);
  const endDateTime = new Date(endDate);

  if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid date format. Must be ISO string.");
  }

  const event = {
    summary: topic,
    description: `Session between mentor and mentee`,
    start: {
      dateTime: startDateTime.toISOString(),
      timeZone: "UTC",
    },
    end: {
      dateTime: endDateTime.toISOString(),
      timeZone: "UTC",
    },
    attendees: [
      { email: mentee.email },
      { email: mentor.email },
    ],
    conferenceData: {
      createRequest: {
        requestId: `meet-${Date.now()}`,
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 24 * 60 },
        { method: "popup", minutes: 30 },
      ],
    },
  };

  // Create event in Google Calendar
  const response = await calendar.events.insert({
    calendarId: "primary",
    requestBody: event,
    conferenceDataVersion: 1,
    sendUpdates: "all", // Send email invites
  });

  const meetLink = response.data.conferenceData?.entryPoints?.find(
    (entry) => entry.entryPointType === "video"
  )?.uri;

  return {
    meetLink
  }

}