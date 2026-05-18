import status from "http-status";
import catchAsync from "../../shared/helpers/catchAsync";
import { Request, Response } from "express";
import sendResponse from "../../shared/helpers/sendResponse";
import ApiError from "../../app/errors/ApiError";
import { ReflextionService } from "./reflextion.service"; // adjust path as needed

// CREATE
const createReflextion = catchAsync(async (req: Request, res: Response) => {
    const { id: userId } = req.user;
    const result = await ReflextionService.createReflextion(userId, req.body);
    sendResponse(res, {
        success: true,
        statusCode: status.CREATED,
        message: "Reflection created successfully!",
        data: result,
    });
});

// GET ALL
const getAllReflextions = catchAsync(async (req: Request, res: Response) => {

    const result = await ReflextionService.getAllReflextions(req.query);
    sendResponse(res, {
        success: true,
        statusCode: status.OK,
        message: "Reflections retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

// GET MY
const getMyReflextions = catchAsync(async (req: Request, res: Response) => {
    const { id: userId } = req.user;
    const result = await ReflextionService.getMyReflextions(userId, req.query);
    sendResponse(res, {
        success: true,
        statusCode: status.OK,
        message: "My Reflections retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

// GET ONE
const getReflextionById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
        throw new ApiError(status.BAD_REQUEST, "Reflection ID is required");
    }
    const result = await ReflextionService.getReflextionById(id);
    sendResponse(res, {
        success: true,
        statusCode: status.OK,
        message: "Reflection retrieved successfully",
        data: result,
    });
});

// UPDATE
const updateReflextion = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const payload = req.body;

    if (!id) {
        throw new ApiError(status.BAD_REQUEST, "Reflection ID is required");
    }

    if (!payload || Object.keys(payload).length === 0) {
        throw new ApiError(status.BAD_REQUEST, "No update data provided");
    }

    const result = await ReflextionService.updateReflextion(id, {
        extractedSkills: payload.extractedSkills,
        impectBullects: payload.impectBullects,
        shortSummary: payload.shortSummary,
    });
    sendResponse(res, {
        success: true,
        statusCode: status.OK,
        message: "Reflection updated successfully",
        data: result,
    });
});

// DELETE
const deleteReflextion = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
        throw new ApiError(status.BAD_REQUEST, "Reflection ID is required");
    }

    const result = await ReflextionService.deleteReflextion(id);
    sendResponse(res, {
        success: true,
        statusCode: status.OK,
        message: result.message || "Reflection deleted successfully",
    });
});

export const ReflextionController = {
    createReflextion,
    getAllReflextions,
    getMyReflextions,
    getReflextionById,
    updateReflextion,
    deleteReflextion,
};

export default ReflextionController;