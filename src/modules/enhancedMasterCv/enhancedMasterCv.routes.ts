import { Router } from "express";
import { EnhancedMasterCvController } from "./enhancedMasterCv.controller";
import { EnhancedMasterCvValidation } from "./enhancedMasterCv.validation";
import validateRequest from "../../app/middlewares/validateRequest";
import auth from "../../app/middlewares/auth";
import { UserRole } from "@prisma/client";

const router = Router();

//  Create
router.post(
  "/create",
  auth(),
  validateRequest(
    EnhancedMasterCvValidation.createEnhancedMasterCvValidationSchema
  ),
  EnhancedMasterCvController.create
);

// Read (Admin — all records)
router.get(
  "/get-all",
  auth(UserRole.ADMIN),
  EnhancedMasterCvController.getAll
);

//  Read (Logged-in user — own CV)
router.get(
  "/my-cv",
  auth(),
  EnhancedMasterCvController.getMyCV
);

//  Read (by CV id)
router.get(
  "/get/:id",
  auth(UserRole.ADMIN),
  EnhancedMasterCvController.getSingle
);



//  Delete (Admin only)
router.delete(
  "/delete/:id",
  auth(UserRole.ADMIN),
  EnhancedMasterCvController.remove
);
router.get(
  "/template/:templateId",
  auth(),
  EnhancedMasterCvController.getTemplateData
);

export const EnhancedMasterCvRoutes = router;