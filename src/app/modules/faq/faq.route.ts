import { Router } from "express";
import { FaqController } from "./faq.controller";
import { FaqValidation } from "./faq.validation";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = Router();

router.post(
  "/create",
  auth(UserRole.ADMIN),
  validateRequest(FaqValidation.createFaqValidationSchema),
  FaqController.create
);

router.get(
  "/get-all",
  auth(UserRole.ADMIN),
  FaqController.getAll
);

router.get(
  "/get/:id",
  auth(),
  FaqController.getSingle
);

router.patch(
  "/update/:id",
  auth(),
  validateRequest(FaqValidation.updateFaqValidationSchema),
  FaqController.update
);

router.delete(
  "/delete/:id",
  auth(UserRole.ADMIN),
  FaqController.remove
);

export const FaqRoutes = router;
