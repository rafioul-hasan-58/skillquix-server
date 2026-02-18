import { NextFunction, Request, Response, Router } from "express";
import { UserValidation } from "./user.validation";
import validateRequest from "../../middlewares/validateRequest";
import { UserController } from "./user.controller";
import ApiError from "../../errors/ApiError";
import status from "http-status";
import auth from "../../middlewares/auth";
import { upload } from "../../utils/upload";
import { uploadFile } from "../../middlewares/uploadFile";
import { parseBody } from "../../middlewares/parseBodyData";
const router = Router();


router.post(
  "/register",
  uploadFile.uploadUserAssets,
  parseBody,
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
  upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.body?.data) {
        req.body = JSON.parse(req.body.data);
      }
      next();
    } catch {
      next(new ApiError(status.BAD_REQUEST, "Invalid JSON in 'data' field"));
    }
  },
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
