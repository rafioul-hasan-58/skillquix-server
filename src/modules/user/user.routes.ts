import { Router } from "express";
import { UserValidation } from "./user.validation";
import { UserController } from "./user.controller";
import { UserRole } from "@prisma/client";
import { uploadFile } from "../../app/middlewares/uploadFile";
import { parseBodyData } from "../../app/middlewares/parseBodyData";
import validateRequest from "../../app/middlewares/validateRequest";
import auth from "../../app/middlewares/auth";
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
  auth(UserRole.ADMIN),
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
  "/admin/dashboard/overview",
  auth(UserRole.ADMIN),
  UserController.adminDashboardOverview
);
router.get(
  "/dashboard/overview",
  auth(UserRole.USER),
  UserController.userDashboardOverview
);
router.get(
  "/dashboard/monthly-insight",
  auth(UserRole.USER),
  UserController.monthlyInsight
);
router.get(
  "/profile-strength",
  auth(UserRole.USER),
  UserController.profileStrength
);
router.get(
  "/streak-milestones",
  auth(UserRole.USER),
  UserController.streakAndMilestones
);
export const UserRoutes = router;
