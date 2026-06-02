import status from "http-status";
import { Request, Response } from "express";
import catchAsync from "../../shared/helpers/catchAsync";
import { ContactMessageService } from "./contactMessage.service";
import sendResponse from "../../shared/helpers/sendResponse";

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await ContactMessageService.create(req.body);
  sendResponse(res, {
    statusCode: status.OK,
    message: "ContactMessage created successfully!",
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await ContactMessageService.getAll(req.query);
  sendResponse(res, {
    statusCode: status.OK,
    message: "ContactMessages retrieved successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const getSingle = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ContactMessageService.getSingle(id);
  sendResponse(res, {
    statusCode: status.OK,
    message: "ContactMessage retrieved successfully!",
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ContactMessageService.update(id, req.body);
  sendResponse(res, {
    statusCode: status.OK,
    message: "ContactMessage updated successfully!",
    data: result,
  });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await ContactMessageService.delete(id);
  sendResponse(res, {
    statusCode: status.OK,
    message: "ContactMessage deleted successfully!",
  });
});
const sendFeedBack = catchAsync(async (req: Request, res: Response) => {
  const { message } = req.body;
  await ContactMessageService.sendFeedBack(req.user.id, message);
  sendResponse(res, {
    statusCode: status.OK,
    message: "Feedback sent successfully!",
  });
});

export const ContactMessageController = {
  create,
  getAll,
  getSingle,
  update,
  remove,
  sendFeedBack
};
