import status from "http-status";
import { Request, Response } from "express";
import catchAsync from "../../shared/helpers/catchAsync";
import { EnhancedMasterCvService } from "./enhancedMasterCv.service";
import sendResponse from "../../shared/helpers/sendResponse";

const create = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id; // assumes auth middleware attaches user
    const result = await EnhancedMasterCvService.create(userId, req.body);
    sendResponse(res, {
        statusCode: status.CREATED,
        message: "EnhancedMasterCv created successfully!",
        data: result,
    });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
    const result = await EnhancedMasterCvService.getAll(req.query);
    sendResponse(res, {
        statusCode: status.OK,
        message: "EnhancedMasterCvs retrieved successfully!",
        meta: result.meta,
        data: result.data,
    });
});

const getSingle = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await EnhancedMasterCvService.getSingle(id);
    sendResponse(res, {
        statusCode: status.OK,
        message: "EnhancedMasterCv retrieved successfully!",
        data: result,
    });
});

const getMyCV = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const result = await EnhancedMasterCvService.getByUserId(userId);
    sendResponse(res, {
        statusCode: status.OK,
        message: "Your EnhancedMasterCv retrieved successfully!",
        data: result,
    });
});


const remove = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    await EnhancedMasterCvService.delete(id);
    sendResponse(res, {
        statusCode: status.OK,
        message: "EnhancedMasterCv deleted successfully!",
    });
});

export const EnhancedMasterCvController = {
    create,
    getAll,
    getSingle,
    getMyCV,
    remove,
};