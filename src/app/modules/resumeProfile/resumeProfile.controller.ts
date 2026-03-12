import { Request, Response } from "express";
import catchAsync from "../../helpers/catchAsync";
import { ResumeProfileService } from "./resumeProfile.service";
import sendResponse from "../../helpers/sendResponse";
import httpStatus from "http-status";

export const ResumeProfileController = {
    create: catchAsync(async (req: Request, res: Response) => {
        const { id: userId } = req.user; // Get from auth middleware
        const result = await ResumeProfileService.create(userId, req.body);
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Resume saved accepted!",
            data: result,
        });
    }),
    getMyResumeProfile: catchAsync(async (req: Request, res: Response) => {
        const { id: userId } = req.user; // Get from auth middleware
        const result = await ResumeProfileService.getMyResumeProfile(userId);
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Resume Profile fetched!",
            data: result,
        });
    }),
}