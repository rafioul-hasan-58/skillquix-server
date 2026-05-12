import status from "http-status";
import { Request, Response } from "express";
import catchAsync from "../../shared/helpers/catchAsync";
import { FaqService } from "./faq.service";
import sendResponse from "../../shared/helpers/sendResponse";

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await FaqService.create(req.body);
  sendResponse(res, {
    statusCode: status.CREATED,
    message: "Faq created successfully!",
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await FaqService.getAll(req.query);
  sendResponse(res, {
    statusCode: status.OK,
    message: "Faqs retrieved successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const getSingle = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await FaqService.getSingle(id);
  sendResponse(res, {
    statusCode: status.OK,
    message: "Faq retrieved successfully!",
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await FaqService.update(id, req.body);
  sendResponse(res, {
    statusCode: status.OK,
    message: "Faq updated successfully!",
    data: result,
  });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await FaqService.delete(id);
  sendResponse(res, {
    statusCode: status.OK,
    message: "Faq deleted successfully!",
  });
});

export const FaqController = {
  create,
  getAll,
  getSingle,
  update,
  remove,
};
