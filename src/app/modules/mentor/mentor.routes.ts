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
router.get(
    "/get-profile",
    auth(UserRole.USER),
    MentorController.getMentorProfile
);
// admin
router.get(
    "/get-mentor/:id",
    auth(),
    MentorController.getMentorById
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
router.get(
    "/request/details/:id",
    auth(UserRole.USER),
    MentorController.requestDetails
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
    "/get-all",
    auth(UserRole.ADMIN),
    MentorController.allMentor
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
router.post(
    "/send-completion",
    auth(UserRole.USER),
    validateRequest(MentorValidations.MentorshipCompletionSchema),
    MentorController.sendMentorshipCompletion
);
router.post(
    "/accpet-completion",
    auth(UserRole.USER),
    validateRequest(MentorValidations.AcceptMentorshipCompletionSchema),
    MentorController.accpeptMentorshipCompletion
);
router.post(
    "/reject-completion/:id",
    auth(UserRole.USER),
    validateRequest(MentorValidations.rejectMentorshipCompletionSchema),
    MentorController.rejectMentorshipCompletion
);


export const MentorRoutes = router;