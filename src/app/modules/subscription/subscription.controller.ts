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
        message: "Subscribed users fetched successfully!",
        data: result,
    });
});
const getSubscriptions = catchAsync(async (req: Request, res: Response) => {
    const result = await SubscriptionService.getSubscriptions(req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: "Subscription fetched successfully!",
        data: result,
    });
});
const cancelSubscription = catchAsync(async (req: Request, res: Response) => {
    const { id: userId } = req.user;
    const result = await SubscriptionService.cancelSubscription(userId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: "Subscription cancelled successfully!",
        data: result,
    });
});


export const SubscriptionController = {
    getSubscriptions,
    createSubscription,
    getSubscribedUser,
    cancelSubscription
}