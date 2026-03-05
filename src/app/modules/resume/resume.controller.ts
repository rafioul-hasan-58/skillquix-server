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
    }),
    // --- PROJECTS ---
    addProject: catchAsync(async (req: Request, res: Response) => {
        const result = await ResumeService.addProject(req.body);
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.CREATED,
            message: "Project added successfully!",
            data: result
        });
    }),
    updateProject: catchAsync(async (req: Request, res: Response) => {
        const result = await ResumeService.updateProject(req.body);
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Project updated successfully!",
            data: result
        });
    }),
    deleteProject: catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const result = await ResumeService.deleteProject(id);
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Project deleted successfully!",
            data: result
        });
    }),

    // --- OTHER LINKS ---
    addOtherLink: catchAsync(async (req: Request, res: Response) => {
        const result = await ResumeService.addOtherLink(req.body);
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.CREATED,
            message: "Link added successfully!",
            data: result
        });
    }),
    updateOtherLink: catchAsync(async (req: Request, res: Response) => {
        const result = await ResumeService.updateOtherLink(req.body);
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Link updated successfully!",
            data: result
        });
    }),
    deleteOtherLink: catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const result = await ResumeService.deleteOtherLink(id);
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Link deleted successfully!",
            data: result
        });
    }),

    // --- LANGUAGES ---
    addLanguage: catchAsync(async (req: Request, res: Response) => {
        const result = await ResumeService.addLanguage(req.body);
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.CREATED,
            message: "Language added successfully!",
            data: result
        });
    }),
    updateLanguage: catchAsync(async (req: Request, res: Response) => {
        const result = await ResumeService.updateLanguage(req.body);
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Language updated successfully!",
            data: result
        });
    }),
    deleteLanguage: catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const result = await ResumeService.deleteLanguage(id);
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Language deleted successfully!",
            data: result
        });
    }),

    // --- CERTIFICATES ---
    addCertificate: catchAsync(async (req: Request, res: Response) => {
        const result = await ResumeService.addCertificate(req.body);
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.CREATED,
            message: "Certificate added successfully!",
            data: result
        });
    }),
    updateCertificate: catchAsync(async (req: Request, res: Response) => {
        const result = await ResumeService.updateCertificate(req.body);
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Certificate updated successfully!",
            data: result
        });
    }),
    deleteCertificate: catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const result = await ResumeService.deleteCertificate(id);
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Certificate deleted successfully!",
            data: result
        });
    }),

    // increment resume parse count
    incrementResumeParseCount: catchAsync(async (req: Request, res: Response) => {
        const { id: userId } = req.user;
        const result = await ResumeService.incrementResumeParseCount(userId);
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Resume parse count updated successfully!.",
            data: result
        });
    }),
}