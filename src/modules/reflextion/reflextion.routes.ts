import { Router } from "express";
import ReflextionController from "./reflextion.controller";
import auth from "../../app/middlewares/auth";
import { UserRole } from "@prisma/client";
import validateRequest from "../../app/middlewares/validateRequest";
import { ReflextionValidation } from "./reflextion.validation";

const router = Router();


router.post(
    "/create",
    auth(UserRole.USER),
    validateRequest(ReflextionValidation.createReflextionSchema),
    ReflextionController.createReflextion
);
router.get(
    "/get-all",
    auth(UserRole.USER),
    ReflextionController.getAllReflextions
);
router.get(
    "/get-my",
    auth(UserRole.USER),
    ReflextionController.getMyReflextions
);
router.get(
    "/details/:id",
    auth(UserRole.USER),
    ReflextionController.getReflextionById
);
router.patch(
    "/update/:id",
    auth(UserRole.USER),
    validateRequest(ReflextionValidation.updateReflextionSchema),
    ReflextionController.updateReflextion
);
router.delete(
    "/delete/:id",
    auth(UserRole.USER),
    ReflextionController.deleteReflextion
);
export const ReflextionRoutes = router;