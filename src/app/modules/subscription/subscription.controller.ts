import { Request, Response } from "express";
import catchAsync from "../../helpers/catchAsync";
import { SubscriptionService } from "./subscription.service";
import sendResponse from "../../helpers/sendResponse";
import httpStatus from "http-status";




const createSubscription = catchAsync(async (req: Request, res: Response) => {
    const { id: userId } = req.user;
    const result = await SubscriptionService.createSubscription(userId, req.body.planId, req.body.paymentMethodId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: "Subscription created successfully!",
        data: result,
    });
});
const getSubscribedUser = catchAsync(async (req: Request, res: Response) => {
    const result = await SubscriptionService.getSubscribedUsers(req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: "Subscribed users feched successfully!",
        data: result,
    });
});


export const SubscriptionController = {
    createSubscription,
    getSubscribedUser
}