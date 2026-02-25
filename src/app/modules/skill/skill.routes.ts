import { Router } from "express";
import { SkillValidations } from "./skill.validation";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";
import { SkillController } from "./skill.controller";


const router = Router();


router.post(
    "/create",
    auth(),
    validateRequest(SkillValidations.createSkillSchema),
    SkillController.create
);


export const SkillRouter = router;