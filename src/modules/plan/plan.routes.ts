import express from "express";
import { PlanController } from "./plan.controller";
import { UserRole } from "@prisma/client";
import auth from "../../app/middlewares/auth";
import validateRequest from "../../app/middlewares/validateRequest";
import { PlanValidation } from "./plan.validation";

const router = express.Router();

router.post(
    "/create",
    auth(UserRole.ADMIN),
    validateRequest(PlanValidation.createPlanSchema),
    PlanController.createPlan
);
router.patch(
    "/update/:id",
    auth(UserRole.ADMIN),
    validateRequest(PlanValidation.updatePlanSchema),
    PlanController.updatePlan
);
router.delete(
    "/delete/:id",
    auth(UserRole.ADMIN),
    PlanController.deletePlan
);
router.get(
    "/get-all",
    PlanController.getAllPlans
);
router.get(
    "/details/:id",
    auth(),
    PlanController.planDetails
);

export const PlanRoutes = router;