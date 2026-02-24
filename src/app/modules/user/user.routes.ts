import { NextFunction, Request, Response, Router } from "express";
import { UserValidation } from "./user.validation";
import validateRequest from "../../middlewares/validateRequest";
import { UserController } from "./user.controller";
import auth from "../../middlewares/auth";
import { uploadFile } from "../../middlewares/uploadFile";
import { parseBodyData } from "../../middlewares/parseBodyData";
import { UserRole } from "@prisma/client";
const router = Router();


router.post(
  "/register",
  uploadFile.uploadUserAssets,
  parseBodyData,
  validateRequest(UserValidation.createUserValidationSchema),
  UserController.register
);
router.get(
  "/get-all",
  auth(UserRole.ADMIN),
  UserController.getAllUser
);

router.get(
  "/get-user/:userId",
  auth(),
  UserController.getSingleUserById
);
router.get(
  "/my-profile",
  auth(),
  UserController.myProfile
);

router.patch(
  "/update-profile",
  uploadFile.uploadProfileImage,
  parseBodyData,
  validateRequest(UserValidation.updateUserValidationSchema),
  auth(),
  UserController.updateProfile
);

router.patch(
  "/block/:userId",
  auth(UserRole.ADMIN),
  UserController.blockUser
);
router.patch(
  "/unblock/:userId",
  auth(UserRole.ADMIN),
  UserController.unblockUser
);
router.delete(
  "/delete/:userId",
  auth(),
  UserController.deleteUser
);
// manager
router.post(
  "/add-manager",
  uploadFile.uploadProfileImage,
  parseBodyData,
  validateRequest(UserValidation.addManagerValidationSchema),
  UserController.addManager
);
router.get(
  "/all-admins",
  auth(UserRole.ADMIN),
  UserController.getAllAdmins
);
router.get(
  "/admin/dashbaord/overview",
  auth(UserRole.ADMIN),
  UserController.adminDashboardOverview
);
export const UserRoutes = router;
