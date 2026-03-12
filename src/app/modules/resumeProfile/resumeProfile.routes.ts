import { Router } from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { ResumeProfileController } from "./resumeProfile.controller";


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

export const ResumeProfileRoutes = router;