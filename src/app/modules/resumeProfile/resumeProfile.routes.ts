import { Router } from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { ResumeProfileController } from "./resumeProfile.controller";
import validateRequest from "../../middlewares/validateRequest";
import { ResumeProfileValidation } from "./resumeProfile.validation";


const router = Router();


router.post(
    "/add",
    auth(UserRole.USER),
    ResumeProfileController.create
);
router.get(
    "/get-my",
    auth(UserRole.USER),
    ResumeProfileController.getMyResumeProfile
);
router.patch(
    "/update-section/:id",
    auth(UserRole.USER),
    validateRequest(ResumeProfileValidation.updateSectionSchema),
    ResumeProfileController.updateSection
);
router.delete(
    "/delete-section/:id",
    auth(UserRole.USER),
    ResumeProfileController.deleteSection
);
router.patch(
    "/update/section-item/:id", 
    auth(UserRole.USER),
    ResumeProfileController.updateSectionItem
);
router.delete(
    "/delete/section-item/:id", 
    auth(UserRole.USER),
    ResumeProfileController.deleteSectionItem
);

export const ResumeProfileRoutes = router;