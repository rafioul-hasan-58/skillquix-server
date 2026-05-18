// masterCv.controller.ts
import { Request, Response } from "express";
import catchAsync from "../../shared/helpers/catchAsync";
import { MasterCvService } from "./masterCv.service";
import sendResponse from "../../shared/helpers/sendResponse";
import httpStatus from "http-status";


const createMasterCv = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user;
  const result = await MasterCvService.createMasterCv(userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: "MasterCv created successfully!",
    data: result,
  });
});
const getMasterCv = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const result = await MasterCvService.getMasterCv(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "MasterCv retrieved successfully!",
    data: result,
  });
});

const deleteMasterCv = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const result = await MasterCvService.deleteMasterCv(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "MasterCv deleted successfully!",
    data: result,
  });
});

export const MasterCvController = {
  createMasterCv,
  getMasterCv,
  deleteMasterCv
};