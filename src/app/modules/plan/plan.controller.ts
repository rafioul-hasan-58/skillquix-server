import { Request, Response } from "express";
import { PlanService } from "./plan.service";
import status from "http-status";
import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../helpers/sendResponse";

const createPlan = catchAsync(async (req: Request, res: Response) => {
    const plan = await PlanService.createPlan(req.body);
    sendResponse(res, {
        statusCode: status.CREATED,
        success: true,
        message: "Plan created successfully",
        data: plan,
    });
});
const updatePlan = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const plan = await PlanService.updatePlan(id, req.body);
    sendResponse(res, {
        statusCode: status.CREATED,
        success: true,
        message: "Plan updated successfully",
        data: plan,
    });
});
const deletePlan = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const plan = await PlanService.deletePlan(id);
    sendResponse(res, {
        statusCode: status.CREATED,
        success: true,
        message: "Plan deleted successfully",
        data: plan,
    });
});
const getAllPlans = catchAsync(async (req: Request, res: Response) => {
    const plan = await PlanService.getAllPlans();
    sendResponse(res, {
        statusCode: status.CREATED,
        success: true,
        message: "All Plans retrieved successfully",
        data: plan,
    });
});
const planDetails = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const plan = await PlanService.planDetails(id);
    sendResponse(res, {
        statusCode: status.CREATED,
        success: true,
        message: "Plan details retrieved successfully",
        data: plan,
    });
});

export const PlanController = {
    createPlan,
    updatePlan,
    deletePlan,
    getAllPlans,
    planDetails
};