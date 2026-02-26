import { Router } from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { SubscriptionController } from "./subscription.controller";
import { SubscriptionValidation } from "./subscription.validation";
import validateRequest from "../../middlewares/validateRequest";

const router = Router();


router.post(
    "/create",
    auth(UserRole.USER),
    validateRequest(SubscriptionValidation.createSubscription),
    SubscriptionController.createSubscription
);
router.post(
    "/cancel",
    auth(UserRole.USER),
    SubscriptionController.cancelSubscription
);
router.post(
    "/upgrade",
    auth(UserRole.USER),
    validateRequest(SubscriptionValidation.upgradeSubscription),
    SubscriptionController.upgradeSubscription
);
router.get(
    "/subscribed-user",
    auth(UserRole.ADMIN),
    SubscriptionController.getSubscribedUser
);
router.get(
    "/get-subscriptions",
    auth(UserRole.ADMIN),
    SubscriptionController.getSubscriptions
);

export const SubscriptionRouter = router