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
router.post(
    "/downgrade",
    auth(UserRole.USER),
    validateRequest(SubscriptionValidation.downgradeSubscription),
    SubscriptionController.downgradeSubscription
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
router.get(
    "/my-subscription",
    auth(UserRole.USER),
    SubscriptionController.getMySubscription
);

export const SubscriptionRouter = router