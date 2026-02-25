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
router.get(
    "/get-my",
    auth(),
    SkillController.getMy
);
router.patch(
    "/update/:id",
    auth(),
    SkillController.updateSkill
);
router.delete(
    "/delete/:id",
    auth(),
    SkillController.deleteSkill
);


export const SkillRouter = router;