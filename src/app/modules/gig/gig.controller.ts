import { Request, Response } from "express";
import status from "http-status";
import { GigService } from "./gig.service";
import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../helpers/sendResponse";

// Create Gig
const createGig = catchAsync(async (req: Request, res: Response) => {
    const result = await GigService.createGig(req.user.id, req.body);
    sendResponse(res, {
        statusCode: status.CREATED,
        message: "Gig created successfully!",
        data: result,
    });
});

// Get All Gigs
const getAllGigs = catchAsync(async (req: Request, res: Response) => {
    const result = await GigService.getAllGigsFromDB(req.query);
    sendResponse(res, {
        statusCode: status.OK,
        message: "Gigs retrieved successfully!",
        data: result.data,
        meta: result.meta,
    });
});

// Get Single Gig
const getSingleGig = catchAsync(async (req: Request, res: Response) => {
    const { gigId } = req.params;
    const { id: userId } = req.user;
    const result = await GigService.getSingleGigByIdFromDB(gigId, userId);
    sendResponse(res, {
        statusCode: status.OK,
        message: "Gig retrieved successfully!",
        data: result,
    });
});

// Update Gig
const updateGig = catchAsync(async (req: Request, res: Response) => {
    const { gigId } = req.params;
    const result = await GigService.updateGig(gigId, req.body);
    sendResponse(res, {
        statusCode: status.OK,
        message: "Gig updated successfully!",
        data: result,
    });
});

// Delete Gig
const deleteGig = catchAsync(async (req: Request, res: Response) => {
    const { gigId } = req.params;
    const result = await GigService.deleteGigFromDB(gigId);
    sendResponse(res, {
        statusCode: status.OK,
        message: "Gig deleted successfully!",
        data: result
    });
});
// save gig
const saveGig = catchAsync(async (req: Request, res: Response) => {
    const { gigId } = req.params;
    const { id: userId } = req.user;
    const result = await GigService.saveGig(gigId, userId);
    sendResponse(res, {
        statusCode: status.OK,
        message: "Gig saved successfully!",
        data: result
    });
});
// save gig
const applyGig = catchAsync(async (req: Request, res: Response) => {
    const { gigId } = req.params;
    const { id: userId } = req.user;
    const result = await GigService.applyGig(gigId, userId);
    sendResponse(res, {
        statusCode: status.OK,
        message: "Gig applied successfully!",
        data: result
    });
});
const mySavedGig = catchAsync(async (req: Request, res: Response) => {
    const { id: userId } = req.user;
    const result = await GigService.mySavedGig(userId, req.query);
    sendResponse(res, {
        statusCode: status.OK,
        message: "Saved gig retrived successfully!",
        meta: result.meta,
        data: result.data,

    });
});

export const GigController = {
    applyGig,
    createGig,
    saveGig,
    getAllGigs,
    getSingleGig,
    updateGig,
    deleteGig,
    mySavedGig
}