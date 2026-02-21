import { Router } from "express";
import auth from "../../middlewares/auth";
import { ResumeController } from "./resume.controller";
import validateRequest, { validateRequestArray } from "../../middlewares/validateRequest";
import { ResumeValidation } from "./resume.validation";
import { UserRole } from "@prisma/client";


const router = Router();


router.post(
    "/create",
    auth(),
    validateRequest(ResumeValidation.createResumeSchema),
    ResumeController.createResume
);
router.delete(
    "/delete/:id",
    auth(UserRole.USER),
    ResumeController.createResume
);
router.patch(
    "/update-personal-info/:id",
    auth(),
    validateRequest(ResumeValidation.updateResumeSchema),
    ResumeController.updatePersonalInfo
);
router.patch(
    "/update-work-exparience",
    auth(),
    validateRequestArray(ResumeValidation.updateWorkExperienceSchema),
    ResumeController.updateWorkExparience
);
router.patch(
    "/update-education",
    auth(),
    validateRequestArray(ResumeValidation.updateEducationSchema),
    ResumeController.updateEducation
);
router.patch(
    "/update-resume-skills",
    auth(),
    validateRequestArray(ResumeValidation.updateSkillsSchema),
    ResumeController.updateResumeSkills
);

export const ResumeRouter = router;