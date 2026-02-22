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


export const SubscriptionRouter = router