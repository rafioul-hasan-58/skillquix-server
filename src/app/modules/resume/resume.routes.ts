import { Router } from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { ResumeController } from "./resume.controller";
import validateRequest, { validateRequestArray } from "../../middlewares/validateRequest";
import { ResumeValidation } from "./resume.validation";


const router = Router();


router.post(
    "/create",
    auth(),
    validateRequest(ResumeValidation.createResumeSchema),
    ResumeController.createResume
);
router.post(
    "/update-personal-info/:id",
    auth(),
    validateRequest(ResumeValidation.updateResumeSchema),
    ResumeController.updatePersonalInfo
);
router.post(
    "/update-work-exparience",
    auth(),
    validateRequestArray(ResumeValidation.updateWorkExperienceSchema),
    ResumeController.updateWorkExparience
);
router.post(
    "/update-education",
    auth(),
    validateRequestArray(ResumeValidation.updateEducationSchema),
    ResumeController.updateEducation
);

export const ResumeRouter = router;