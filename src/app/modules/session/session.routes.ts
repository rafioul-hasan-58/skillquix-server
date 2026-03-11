import { Router } from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { SessionController } from "./session.controller";
import validateRequest from "../../middlewares/validateRequest";
import { SessionValidation } from "./session.validation";


const router = Router();

router.post(
    "/send-request",
    auth(UserRole.USER),
    validateRequest(SessionValidation.sendSessionRequestSchema),
    SessionController.sendSessionRequest
);
router.get(
    "/auth/url",
    auth(UserRole.USER),
    SessionController.getAuthUrl
);
router.post(
    "/auth/save-token",
    SessionController.handleCallback
);
// mentor
router.get(
    "/my-requests",
    auth(UserRole.USER),
    SessionController.mySessionRequests
);
export const SessionRoutes = router;