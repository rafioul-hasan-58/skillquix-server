import { Request, Response } from "express";
import catchAsync from "../../shared/helpers/catchAsync";
import { ResumeProfileService } from "./resumeProfile.service";
import sendResponse from "../../shared/helpers/sendResponse";
import httpStatus from "http-status";
import { resumeQueue } from "../../infrastructure/queue/queues/resume.queue";

const create = catchAsync(async (req: Request, res: Response) => {
    const { id: userId } = req.user; // Get from auth middleware
    const result = await ResumeProfileService.create(userId, req.body);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Resume saved accepted!",
        data: result,
    });
});

const getMyResumeProfile = catchAsync(async (req: Request, res: Response) => {
    const { id: userId } = req.user; // Get from auth middleware
    const result = await ResumeProfileService.getMyResumeProfile(userId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Resume Profile fetched!",
        data: result,
    });
});

const updateSection = catchAsync(async (req: Request, res: Response) => {
    const { id: sectionId } = req.params; // Get from auth middleware
    const result = await ResumeProfileService.updateSection(sectionId, req.body);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Resume profile section updated!",
        data: result,
    });
});

const deleteSection = catchAsync(async (req: Request, res: Response) => {
    const { id: sectionId } = req.params; // Get from auth middleware
    const result = await ResumeProfileService.deleteSection(sectionId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Resume profile section deleted!",
        data: result,
    });
});

const updateSectionItem = catchAsync(async (req: Request, res: Response) => {
    const { id: itemId } = req.params; // Get from auth middleware
    const result = await ResumeProfileService.updateSectionItem(itemId, req.body);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Resume profile section item updated!",
        data: result,
    });
});

const deleteSectionItem = catchAsync(async (req: Request, res: Response) => {
    const { id: itemId } = req.params; // Get from auth middleware
    const result = await ResumeProfileService.deleteSectionItem(itemId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Resume profile section item deleted!",
        data: result,
    });
});

export const ResumeProfileController = {
    create,
    getMyResumeProfile,
    updateSection,
    deleteSection,
    updateSectionItem,
    deleteSectionItem,
}

export const getResumeQueue = catchAsync(async (req: Request, res: Response) => {
    const waiting = await resumeQueue.getWaiting();
    const active = await resumeQueue.getActive();
    const completed = await resumeQueue.getCompleted();
    const failed = await resumeQueue.getFailed();

    const status = {
        waiting: waiting.map(j => ({ id: j.id, data: j.data })),
        active: active.map(j => ({ id: j.id, data: j.data })),
        completed: completed.map(j => ({ id: j.id, data: j.data })),
        failed: failed.map(j => ({ id: j.id, data: j.data, reason: j.failedReason })),
    };

    console.log("📊 Queue Status:", JSON.stringify(status, null, 2));

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: "Queue retrieved successfully!",
        data: status,
    });

});