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
    "/details/:id",
    auth(UserRole.USER),
    SessionController.sessionDetails
);
router.post(
    "/accept",
    auth(UserRole.USER),
    validateRequest(SessionValidation.acceptSessionRequestSchema),
    SessionController.acceptSessionRequest
);
router.post(
    "/decline",
    auth(UserRole.USER),
    validateRequest(SessionValidation.declineSessionRequestSchema),
    SessionController.declineSessionRequest
);
export const SessionRoutes = router;