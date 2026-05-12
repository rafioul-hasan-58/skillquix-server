import status from "http-status";
import { AccomplishmentService } from "./accomplishment.service";
import catchAsync from "../../shared/helpers/catchAsync";
import { Request, Response } from "express";
import sendResponse from "../../shared/helpers/sendResponse";
import ApiError from "../../app/errors/ApiError";

export const AccomplishmentController = {
    // Create new accomplishment
    createAccomplishment: catchAsync(async (req: Request, res: Response) => {
        const userId = req.user?.id as string; // from auth middleware
        const result = await AccomplishmentService.createAccomplishment({ ...req.body, userId });
        sendResponse(res, {
            success: true,
            statusCode: status.CREATED,
            message: "Accomplishment created successfully!",
            data: result,
        });
    }),

    // Get all accomplishments (of the logged-in user)
    getMyAccomplishments: catchAsync(async (req: Request, res: Response) => {
        const userId = req.user?.id as string;
        const result = await AccomplishmentService.getAllAccomplishments(userId);
        sendResponse(res, {
            success: true,
            statusCode: status.OK,
            message: "Accomplishments retrieved successfully",
            data: result,
        });
    }),

    // Get single accomplishment (with ownership check inside service)
    getAccomplishment: catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const userId = req.user?.id as string;
        const result = await AccomplishmentService.getAccomplishmentById(id, userId);
        sendResponse(res, {
            success: true,
            statusCode: status.OK,
            message: "Accomplishment retrieved successfully",
            data: result,
        });
    }),

    // Update accomplishment
    updateAccomplishment: catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const userId = req.user?.id as string;
        const { title, description, date } = req.body;

        const result = await AccomplishmentService.updateAccomplishment(
            id,
            { title, description, date },
            userId
        );

        sendResponse(res, {
            success: true,
            statusCode: status.OK,
            message: "Accomplishment updated successfully!",
            data: result,
        });
    }),

    // Delete accomplishment
    deleteAccomplishment: catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const userId = req.user?.id as string;
        await AccomplishmentService.deleteAccomplishment(id, userId);
        sendResponse(res, {
            success: true,
            statusCode: status.OK,
            message: "Accomplishment deleted successfully!",
        });
    }),
};