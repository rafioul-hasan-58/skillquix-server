import { Router } from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { MentorController } from "./mentor.controller";
import { MentorValidations } from "./mentor.validation";
import validateRequest from "../../middlewares/validateRequest";


const router = Router();

// mentor
router.post(
    "/setup-profile",
    auth(UserRole.USER),
    validateRequest(MentorValidations.setupMentorProfileSchema),
    MentorController.setupMentorProfile
);

// mentor
router.patch(
    "/update-profile",
    auth(UserRole.USER),
    validateRequest(MentorValidations.updateMentorProfileSchema),
    MentorController.updateMentorProfile
);
router.get(
    "/my-requests",
    auth(UserRole.USER),
    MentorController.getMyRequests
);
router.post(
    "/request/accept/:id",
    auth(UserRole.USER),
    MentorController.acceptMentorshipRequest
);
router.post(
    "/request/reject/:id",
    auth(UserRole.USER),
    MentorController.rejectMentorshipRequest
);

// admin
router.get(
    "/pending",
    auth(UserRole.ADMIN),
    MentorController.getPendingMentors
);
router.post(
    "/approve/:id",
    auth(UserRole.ADMIN),
    MentorController.approveMentor
);
// mentee
router.post(
    "/send-request",
    auth(UserRole.USER),
    validateRequest(MentorValidations.mentorshipRequestSchema),
    MentorController.sendMentorshipRequest
);
router.get(
    "/my",
    auth(UserRole.USER),
    MentorController.myMentors
);
router.patch(
    "/profile/activate",
    auth(UserRole.USER),
    MentorController.activateMentorProfile
);

router.patch(
    "/profile/deactivate",
    auth(UserRole.USER),
    MentorController.deactivateMentorProfile
);


export const MentorRoutes = router;