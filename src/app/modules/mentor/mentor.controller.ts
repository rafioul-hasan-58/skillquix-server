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
    getMentorProfile: catchAsync(async (req: Request, res: Response) => {
        const { id } = req.user;
        const result = await MentorService.getMentorProfile(id);
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Mentor profile fetched successfully!",
            data: result,
        });
    }),
    // mentor
    updateMentorProfile: async (req: Request, res: Response) => {
        const userId = req.user?.id;
        const payload = req.body;
        const result = await MentorService.updateMentorProfile(userId, payload);

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Mentor profile updated successfully!",
            data: result,
        });
    },
    // mentor
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
    // mentor
    requestDetails: catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const { id: userId } = req.user;
        const result = await MentorService.requestDetails(id, userId, req.query);
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Mentorship request details retrieved successfully!",
            data: result,
        });
    }),
    // mentor
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
    // mentor
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
    // admin
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
    // mentee
    myMentors: catchAsync(async (req: Request, res: Response) => {
        const { id } = req.user;
        const result = await MentorService.myMentors(id);
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "My mentors fetched!",
            data: result,
        });
    }),
    // mentor
    activateMentorProfile: catchAsync(async (req: Request, res: Response) => {
        const userId = req.user?.id;

        const result = await MentorService.activateMentorProfile(userId);

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Mentor profile activated successfully!",
            data: result,
        });
    }),

    deactivateMentorProfile: catchAsync(async (req: Request, res: Response) => {
        const userId = req.user?.id;

        const result = await MentorService.deactivateMentorProfile(userId);

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Mentor profile deactivated successfully!",
            data: result,
        });
    }),
    sendMentorshipCompletion: catchAsync(async (req: Request, res: Response) => {
        const result = await MentorService.sendMentorshipCompletion(req.body);
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Completion sent!",
            data: result,
        });
    }),
    accpeptMentorshipCompletion: catchAsync(async (req: Request, res: Response) => {
        const result = await MentorService.acceptMentorshipCompletion(req.body);
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Completion accepted!",
            data: result,
        });
    }),
    rejectMentorshipCompletion: catchAsync(async (req: Request, res: Response) => {
        const completionId = req.params?.id;
        const result = await MentorService.rejectMentorshipCompletion(completionId);
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Completion rejected!",
            data: result,
        });
    }),
}