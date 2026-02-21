import { NextFunction, Request, Response, Router } from "express";
import { UserValidation } from "./user.validation";
import validateRequest from "../../middlewares/validateRequest";
import { UserController } from "./user.controller";
import ApiError from "../../errors/ApiError";
import status from "http-status";
import auth from "../../middlewares/auth";
import { upload } from "../../utils/upload";
import { uploadFile } from "../../middlewares/uploadFile";
import { parseBodyData } from "../../middlewares/parseBodyData";
const router = Router();


router.post(
  "/register",
  uploadFile.uploadUserAssets,
  parseBodyData,
  validateRequest(UserValidation.createUserValidationSchema),
  UserController.register
);
router.get("/get-all-users", auth(), UserController.getAllUser);

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

router.delete(
  "/delete-user/:userId",
  auth(),
  UserController.deleteUser
);


export const UserRoutes = router;
