import { Request, Response } from "express";
import catchAsync from "../../helpers/catchAsync";
import httpStatus from "http-status";
import sendResponse from "../../helpers/sendResponse";
import { getAuthUrl, SessionService } from "./session.service";
import ApiError from "../../errors/ApiError";

export const SessionController = {
    sendSessionRequest: catchAsync(async (req: Request, res: Response) => {
        const { requestId } = req.body;
        const result = await SessionService.sendSessionRequest(requestId, req.body);
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Session request sent!",
            data: result
        });
    }),
    // mentor
    sessionDetails: catchAsync(async (req: Request, res: Response) => {
        const { id: sessionId } = req.params;
        const result = await SessionService.sessionDetails(sessionId);
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "My Session requests fetched!",
            data: result
        });
    }),
    // auth
    getAuthUrl: catchAsync(async (req: Request, res: Response) => {
        const userId = req.user?.id; // Get from auth middleware
        const result = await getAuthUrl(userId);
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Google OAuth URL generated successfully",
            data: result,
        });
    }),
    handleCallback: catchAsync(async (req: Request, res: Response) => {
        const { code, state } = req.body;

        if (!code || typeof code !== "string") {
            throw new ApiError(httpStatus.BAD_REQUEST, "Authorization code is required");
        }

        if (!state || typeof state !== "string") {
            throw new ApiError(httpStatus.BAD_REQUEST, "State parameter is required");
        }

        const result = await SessionService.handleOAuthCallback(code, state);
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Google Calendar connected successfully!",
            data: result,
        });
    }),
    // mentor
    acceptSessionRequest: catchAsync(async (req: Request, res: Response) => {
        const { id: sessionId } = req.params; // Get from auth middleware
        const result = await SessionService.acceptSessionRequest(sessionId, req.body);
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Session request accepted!",
            data: result,
        });
    }),
}