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
const upgradeSubscription = catchAsync(async (req: Request, res: Response) => {
    const { id: userId } = req.user;
    const { newPlanId } = req.body;
    const result = await SubscriptionService.upgradeSubscription(userId, newPlanId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: "Subscription upgraded successfully!",
        data: result,
    });
});
const downgradeSubscription = catchAsync(async (req: Request, res: Response) => {
    const { id: userId } = req.user;
    const { newPlanId } = req.body;
    const result = await SubscriptionService.downgradeSubscription(userId, newPlanId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: "Subscription downgraded successfully!",
        data: result,
    });
});
const getMySubscription = catchAsync(async (req: Request, res: Response) => {
    const { id: userId } = req.user;
    const result = await SubscriptionService.getMySubscription(userId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: "My subscription  successfully!",
        data: result,
    });
});


export const SubscriptionController = {
    getSubscriptions,
    createSubscription,
    getSubscribedUser,
    cancelSubscription,
    upgradeSubscription,
    downgradeSubscription,
    getMySubscription
}