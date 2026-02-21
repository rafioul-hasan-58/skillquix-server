import {  Router } from "express";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { GigController } from "./gig.controller";
import { GigValidation } from "./gig.validation";

const router = Router();

// Create Gig
router.post(
  "/create",
  validateRequest(GigValidation.createGigValidationSchema),
  auth(UserRole.ADMIN), // only admin can create gigs
  GigController.createGig
);

// Get All Gigs
router.get(
  "/get-all",
  auth(), // accessible to authenticated users
  GigController.getAllGigs
);

// Get Single Gig
router.get(
  "/get-gig/:gigId",
  auth(),
  GigController.getSingleGig
);

// Update Gig
router.patch(
  "/update/:gigId",
  validateRequest(GigValidation.updateGigValidationSchema),
  auth(UserRole.ADMIN),
  GigController.updateGig
);

// Delete Gig
router.delete(
  "/delete/:gigId",
  auth(UserRole.ADMIN),
  GigController.deleteGig
);

export const GigRoutes = router;
