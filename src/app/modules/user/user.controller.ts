import status from "http-status";
import { Request, Response } from "express";
import catchAsync from "../../helpers/catchAsync";
import { UserService } from "./user.service";
import sendResponse from "../../helpers/sendResponse";
import config from "../../../config";
import { getImageUrl } from "../../middlewares/uploadFile";

interface UserAssetsFiles {
  profileImage?: Express.MulterS3.File[];
  resume?: Express.MulterS3.File[];
}
const register = catchAsync(async (req: Request, res: Response) => {
  // Convert files to URLs
  const files = req.files as unknown as UserAssetsFiles;
  const profileImage = files.profileImage
    ? await getImageUrl(files.profileImage[0])
    : undefined;

  const resumeLink = files.resume
    ? await getImageUrl(files.resume[0])
    : undefined;
  const { accessToken, refreshToken } = await UserService.register({ ...req.body, profileImage, resumeLink });
  res.cookie("refreshToken", refreshToken, {
    secure: false,
    httpOnly: true,
  });

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "User registered successfully!",
    data: {
      accessToken
    },
  });
});
const getAllUser = catchAsync(async (req, res) => {
  const result = await UserService.getAllUserFromDB(req.query);
  sendResponse(res, {
    statusCode: status.OK,
    message: "Users are retrieved successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const updateProfile = catchAsync(async (req, res) => {
  const { id } = req.user;
  if (req.file) {
    req.body.profileImage = await getImageUrl(req.file as any);
  }
  const result = await UserService.updateProfile(id, req.body);
  sendResponse(res, {
    statusCode: status.OK,
    message: "User updated successfully!",
    data: result,
  });
});
const myProfile = catchAsync(async (req, res) => {
  const { id } = req.user;
  const result = await UserService.myProfile(id);
  sendResponse(res, {
    statusCode: status.OK,
    message: "My profile fetched successfully!",
    data: result,
  });
});

const getSingleUserById = catchAsync(async (req, res) => {
  const { userId } = req.params;

  const result = await UserService.getSingleUserByIdFromDB(userId);

  sendResponse(res, {
    statusCode: status.OK,
    message: "User retrieved successfully!",
    data: result,
  });
});

const deleteUser = catchAsync(async (req, res) => {
  const { userId } = req.params;

  await UserService.deleteUserFromDB(userId);

  sendResponse(res, {
    statusCode: status.OK,
    message: "User deleted successfully!",
  });
});

export const UserController = {
  register,
  getAllUser,
  updateProfile,
  deleteUser,
  myProfile,
  getSingleUserById,
};
