import { Request, Response } from "express";
import catchAsync from "../../shared/helpers/catchAsync";
import httpStatus from "http-status";
import sendResponse from "../../shared/helpers/sendResponse";
import { SessionService } from "./session.service";

const sendSessionRequest = catchAsync(async (req: Request, res: Response) => {
    const { requestId } = req.body;
    const result = await SessionService.sendSessionRequest(requestId, req.body);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Session request sent!",
        data: result
    });
});

// mentor
const sessionDetails = catchAsync(async (req: Request, res: Response) => {
    const { id: sessionId } = req.params;
    const result = await SessionService.sessionDetails(sessionId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "My Session requests fetched!",
        data: result
    });
});

// mentor
const acceptSessionRequest = catchAsync(async (req: Request, res: Response) => {
    const result = await SessionService.acceptSessionRequest(req.body);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Session request accepted!",
        data: result,
    });
});

// mentor
const declineSessionRequest = catchAsync(async (req: Request, res: Response) => {
    const result = await SessionService.declineSessionRequest(req.body);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Session request declined!",
        data: result,
    });
});

export const SessionController = {
    sendSessionRequest,
    sessionDetails,
    acceptSessionRequest,
    declineSessionRequest,
}