import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import { google } from "googleapis";
import config from "../../../config";
import prisma from "../../lib/prisma";

export const oauth2Client = new google.auth.OAuth2(
  config.google_oauth.client_id,
  config.google_oauth.client_secret,
  config.google_oauth.redirect_url,
);

// export const refreshAccessToken = async (googleAdmin: any) => {
//   if (!googleAdmin.refreshToken) {
//     throw new ApiError(httpStatus.UNAUTHORIZED, "No refresh token available. Please re-authenticate.");
//   }

//   oauth2Client.setCredentials({
//     refresh_token: googleAdmin.refreshToken,
//   });

//   const { credentials } = await oauth2Client.refreshAccessToken();

//   // Update tokens in database
//   await prisma.user.update({
//     where: { id: googleAdmin.id },
//     data: {
//       accessToken: credentials.access_token,
//       tokenExpiry: credentials.expiry_date ? new Date(credentials.expiry_date) : undefined,
//     },
//   });

//   return credentials.access_token;
// };

// Helper: Get Valid Access Token
// export const getValidAccessToken = async (googleAdmin: any) => {
//   const now = new Date();

//   // Check if token is expired or about to expire (5 min buffer)
//   if (googleAdmin.tokenExpiry && new Date(googleAdmin.tokenExpiry).getTime() - now.getTime() < 5 * 60 * 1000) {
//     return await refreshAccessToken(googleAdmin);
//   }

//   return googleAdmin.accessToken;
// };
