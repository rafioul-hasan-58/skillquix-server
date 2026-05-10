import { Request, Response } from "express";
import catchAsync from "../../helpers/catchAsync";
import httpStatus from "http-status";
import sendResponse from "../../helpers/sendResponse";
import { SessionService } from "./session.service";

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

    // mentor
    acceptSessionRequest: catchAsync(async (req: Request, res: Response) => {
        const result = await SessionService.acceptSessionRequest(req.body);
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Session request accepted!",
            data: result,
        });
    }),
    // mentor
    declineSessionRequest: catchAsync(async (req: Request, res: Response) => {
        const result = await SessionService.declineSessionRequest(req.body);
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Session request declined!",
            data: result,
        });
    }),
}