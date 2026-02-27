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
    const result = await GigService.getSingleGigByIdFromDB(gigId);
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

export const GigController = {
    createGig,
    getAllGigs,
    getSingleGig,
    updateGig,
    deleteGig,
}