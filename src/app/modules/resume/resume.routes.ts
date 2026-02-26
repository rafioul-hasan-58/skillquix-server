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
router.get(
    "/my",
    auth(),
    ResumeController.getMyResume
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
    "/update-work-experience",
    auth(),
    validateRequestArray(ResumeValidation.updateWorkExperienceSchema),
    ResumeController.updateWorkExperience
);
router.post(
    "/add-work-experience",
    auth(),
    validateRequest(ResumeValidation.addWorkExperienceSchema),
    ResumeController.addWorkExperience
);
router.patch(
    "/update-education",
    auth(),
    validateRequestArray(ResumeValidation.updateEducationSchema),
    ResumeController.updateEducation
);
router.post(
    "/add-education",
    auth(),
    validateRequestArray(ResumeValidation.addEducationSchema),
    ResumeController.addEducation
);
router.patch(
    "/update-resume-skills",
    auth(),
    validateRequestArray(ResumeValidation.updateSkillsSchema),
    ResumeController.updateResumeSkills
);
router.post(
    "/add-resume-skill",
    auth(),
    validateRequestArray(ResumeValidation.addSkillSchema),
    ResumeController.addResumeSkill
);

export const ResumeRouter = router;