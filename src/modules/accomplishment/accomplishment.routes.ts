import { Router } from "express";
import auth from "../../app/middlewares/auth";
import validateRequest from "../../app/middlewares/validateRequest";
import { AccomplishmentController } from "./accomplishment.controller";
import { AccomplishmentValidation } from "./accomplishment.validation";

const router = Router();

router.post(
  "/create",
  auth(),
  validateRequest(AccomplishmentValidation.create),
  AccomplishmentController.createAccomplishment
);

router.get(
  "/my",
  auth(),
  AccomplishmentController.getMyAccomplishments
);

router.get(
  "/details/:id",
  auth(),
  AccomplishmentController.getAccomplishment
);

router.patch(
  "/update/:id",
  auth(),
  validateRequest(AccomplishmentValidation.update),
  AccomplishmentController.updateAccomplishment
);

router.delete(
  "/delete/:id",
  auth(),
  AccomplishmentController.deleteAccomplishment
);

export const AccomplishmentRoutes = router;