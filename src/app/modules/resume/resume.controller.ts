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
    getMyResume: catchAsync(async (req: Request, res: Response) => {
        const { id: userId } = req.user;
        const result = await ResumeService.getMyResume(userId);
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Resume fetched successfully!",
            data: result
        });
    }),
    deleteResume: catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const result = await ResumeService.deleteResume(id);
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Resume deleted successfully!",
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
    addWorkExperience: catchAsync(async (req: Request, res: Response) => {
        const result = await ResumeService.addWorkExperience(req.body);
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Work Experience added successfully!",
            data: result
        });
    }),
    updateWorkExperience: catchAsync(async (req: Request, res: Response) => {
        const result = await ResumeService.updateWorkExperience(req.body);
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Work Experience updated successfully!",
            data: result
        });
    }),
    addEducation: catchAsync(async (req: Request, res: Response) => {
        const result = await ResumeService.addEducation(req.body);
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Education added successfully!",
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
    }),
    updateResumeSkills: catchAsync(async (req: Request, res: Response) => {
        const result = await ResumeService.updateResumeSkills(req.body);
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Resume Skills updated successfully!",
            data: result
        });
    }),
    addResumeSkill: catchAsync(async (req: Request, res: Response) => {
        const result = await ResumeService.addResumeSkill(req.body);
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Resume Skills added successfully!",
            data: result
        });
    })
}