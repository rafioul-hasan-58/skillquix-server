import { Request, Response } from "express";
import catchAsync from "../../helpers/catchAsync";
import { AuthService } from "../auth/auth.service";
import sendResponse from "../../helpers/sendResponse";
import httpStatus from "http-status";
import { ResumeService } from "./resume.service";



export const ResumeController = {
    createResume: catchAsync(async (req: Request, res: Response) => {
        const { id } = req.user;
        const result = await ResumeService.createResume(id, req.body);
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.CREATED,
            message: "Resume created successfully!",
            data: result
        });
    }),
    updatePersonalInfo: catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const result = await ResumeService.updatePersonalInfo(id, req.body);
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Personal info updated successfully!",
            data: result
        });
    }),
    updateWorkExparience: catchAsync(async (req: Request, res: Response) => {
        const result = await ResumeService.updateWorkExperience(req.body);
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Work Exparience updated successfully!",
            data: result
        });
    }),
    updateEducation: catchAsync(async (req: Request, res: Response) => {
        const result = await ResumeService.updateEducation(req.body);
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Education updated successfully!",
            data: result
        });
    })
}