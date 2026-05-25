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
  const { id: userId } = req.user;
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

const downloadCvPdf = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user;
  const { templateId } = req.params;
  const name ="Your resume";
  const payload = req.body;
  const pdfBuffer = await MasterCvService.generateCvPdf(userId, templateId,req.body);

  const safeName = name.replace(/\s+/g, "_").toLowerCase();

  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="${safeName}_cv.pdf"`,
    "Content-Length": pdfBuffer.length,
  });

  res.status(httpStatus.OK).end(pdfBuffer);
});

const addChallange = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user;
  const result = await MasterCvService.addChallange(userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: "Challange added successfully!",
    data: result,
  });
});
const getChallengeStory = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user;
  const result = await MasterCvService.getChallengeStory(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Challenge Story fetched successfully!",
    data: result,
  });
});

export const MasterCvController = {
  createMasterCv,
  getMasterCv,
  deleteMasterCv,
  addChallange,
  downloadCvPdf,
  getChallengeStory
};