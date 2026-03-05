import { Router } from "express";
import auth from "../../middlewares/auth";
import { ResumeController } from "./resume.controller";
import validateRequest, { validateRequestArray } from "../../middlewares/validateRequest";
import { ResumeValidation } from "./resume.validation";
import { UserRole } from "@prisma/client";

const router = Router();

// --- RESUME ---
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
    ResumeController.deleteResume  // ✅ fixed wrong controller
);
router.patch(
    "/update-personal-info/:id",
    auth(),
    validateRequest(ResumeValidation.updateResumeSchema),
    ResumeController.updatePersonalInfo
);

// --- EXPERIENCE ---
router.post(
    "/add-work-experience",
    auth(),
    validateRequest(ResumeValidation.addWorkExperienceSchema),
    ResumeController.addWorkExperience
);
router.patch(
    "/update-work-experience",
    auth(),
    validateRequestArray(ResumeValidation.updateWorkExperienceSchema),
    ResumeController.updateWorkExperience
);

// --- EDUCATION ---
router.post(
    "/add-education",
    auth(),
    validateRequest(ResumeValidation.addEducationSchema),
    ResumeController.addEducation
);
router.patch(
    "/update-education",
    auth(),
    validateRequestArray(ResumeValidation.updateEducationSchema),
    ResumeController.updateEducation
);

// --- SKILLS ---
router.post(
    "/add-resume-skill",
    auth(),
    validateRequest(ResumeValidation.addSkillSchema),
    ResumeController.addResumeSkill
);
router.patch(
    "/update-resume-skills",
    auth(),
    validateRequestArray(ResumeValidation.updateSkillsSchema),
    ResumeController.updateResumeSkills
);

// --- PROJECTS ---
router.post(
    "/add-project",
    auth(),
    validateRequest(ResumeValidation.addProjectSchema),
    ResumeController.addProject
);
router.patch(
    "/update-project",
    auth(),
    validateRequestArray(ResumeValidation.updateProjectSchema),
    ResumeController.updateProject
);
router.delete(
    "/delete-project/:id",
    auth(),
    ResumeController.deleteProject
);

// --- OTHER LINKS ---
router.post(
    "/add-other-link",
    auth(),
    validateRequest(ResumeValidation.addOtherLinkSchema),
    ResumeController.addOtherLink
);
router.patch(
    "/update-other-link",
    auth(),
    validateRequestArray(ResumeValidation.updateOtherLinkSchema),
    ResumeController.updateOtherLink
);
router.delete(
    "/delete-other-link/:id",
    auth(),
    ResumeController.deleteOtherLink
);

// --- LANGUAGES ---
router.post(
    "/add-language",
    auth(),
    validateRequest(ResumeValidation.addLanguageSchema),
    ResumeController.addLanguage
);
router.patch(
    "/update-language",
    auth(),
    validateRequestArray(ResumeValidation.updateLanguageSchema),
    ResumeController.updateLanguage
);
router.delete(
    "/delete-language/:id",
    auth(),
    ResumeController.deleteLanguage
);

// --- CERTIFICATES ---
router.post(
    "/add-certificate",
    auth(),
    validateRequest(ResumeValidation.addCertificateSchema),
    ResumeController.addCertificate
);
router.patch(
    "/update-certificate",
    auth(),
    validateRequestArray(ResumeValidation.updateCertificateSchema),
    ResumeController.updateCertificate
);
router.delete(
    "/delete-certificate/:id",
    auth(),
    ResumeController.deleteCertificate
);

// increment resume parse count
router.post(
    "/increment-parse-count",
    auth(UserRole.USER),
    ResumeController.incrementResumeParseCount
);

export const ResumeRouter = router;