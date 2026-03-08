import { Request, Response } from "express";
import catchAsync from "../../helpers/catchAsync";
import httpStatus from "http-status";
import { MentorService } from "./mentor.service";
import sendResponse from "../../helpers/sendResponse";

export const MentorController = {
    // mentor
    setupMentorProfile: catchAsync(async (req: Request, res: Response) => {
        const { id } = req.user;
        const result = await MentorService.setupMentorProfile(id, req.body);
        sendResponse(res, {
            statusCode: httpStatus.CREATED,
            success: true,
            message: "Mentor profile setup successfully!",
            data: result,
        });
    }),
    getMyRequests: catchAsync(async (req: Request, res: Response) => {
        const { id } = req.user;
        const result = await MentorService.getMyRequests(id, req.query);
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "My request fetched!",
            meta: result.meta,
            data: result.data,
        });
    }),
    acceptMentorshipRequest: catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const result = await MentorService.acceptMentorshipRequest(id);
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Mentorship request accepted!",
            data: result,
        });
    }),
    rejectMentorshipRequest: catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const result = await MentorService.rejectMentorshipRequest(id);
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Mentorship request rejected!",
            data: result,
        });
    }),
    // admin
    getPendingMentors: catchAsync(async (req: Request, res: Response) => {
        const result = await MentorService.getPendingMentors();
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Pending mentors retrieved successfully!",
            data: result,
        });
    }),
    approveMentor: catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const result = await MentorService.approveMentor(id);
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Mentor approved successfully!",
            data: result,
        });
    }),

    // mentee
    sendMentorshipRequest: catchAsync(async (req: Request, res: Response) => {
        const { id } = req.user;
        const result = await MentorService.sendMentorshipRequest(id, req.body);
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Mentorship request sent!",
            data: result,
        });
    }),

}