import status from "http-status";
import { Request, Response } from "express";
import catchAsync from "../../shared/helpers/catchAsync";
import { UserService } from "./user.service";
import sendResponse from "../../shared/helpers/sendResponse";
import { getImageUrl } from "../../app/middlewares/uploadFile";

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
  const result = await UserService.register({ ...req.body, profileImage, resumeLink });

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: result.message,
    data: {
      expiresAt: result.expiresAt,
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


const blockUser = catchAsync(async (req, res) => {
  const { userId } = req.params;
  await UserService.blockUser(userId);
  sendResponse(res, {
    statusCode: status.OK,
    message: "User blocked successfully!",
  });
})

const unblockUser = catchAsync(async (req, res) => {
  const { userId } = req.params;
  await UserService.unblockUser(userId);
  sendResponse(res, {
    statusCode: status.OK,
    message: "User unblocked successfully!",
  });
});
// manager
const addManager = catchAsync(async (req, res) => {
  if (req.file) {
    req.body.profileImage = await getImageUrl(req.file as any);
  }
  const result = await UserService.addManager(req.body);
  sendResponse(res, {
    statusCode: status.OK,
    message: "Manager added successfully!",
    data: result
  });
})
const getAllAdmins = catchAsync(async (req, res) => {
  const result = await UserService.getAllAdmins(req.query);
  sendResponse(res, {
    statusCode: status.OK,
    message: "All admins successfully!",
    meta: result.meta,
    data: result.data,
  });
});
const adminDashboardOverview = catchAsync(async (req, res) => {
  const result = await UserService.adminDashboardOverview();
  sendResponse(res, {
    statusCode: status.OK,
    message: "Dashboard overview fetched successfully!",
    data: result,
  });
});
const userDashboardOverview = catchAsync(async (req, res) => {
  const { id: userId } = req.user;
  const result = await UserService.userDashboardOverview(userId);
  sendResponse(res, {
    statusCode: status.OK,
    message: "User dashboard overview fetched successfully!",
    data: result,
  });
});
const monthlyInsight = catchAsync(async (req, res) => {
  const { id: userId } = req.user;
  const result = await UserService.monthlyInsight(userId);
  sendResponse(res, {
    statusCode: status.OK,
    message: "Monthly insight fetched successfully!",
    data: result,
  });
});
const profileStrength = catchAsync(async (req, res) => {
  const { id } = req.user;
  const result = await UserService.getProfileStrength(id);
  sendResponse(res, {
    statusCode: status.OK,
    message: "Profile strength fetched successfully!",
    data: result,
  });
});

const streakAndMilestones = catchAsync(async (req, res) => {
  const { id } = req.user;
  const result = await UserService.getStreakAndMilestones(id);
  sendResponse(res, {
    statusCode: status.OK,
    message: "Streak and milestones fetched successfully!",
    data: result,
  });
});

const carrierGrowth = catchAsync(async (req, res) => {
  const { id } = req.user;
  const result = await UserService.getCarrierGrowth(id);
  sendResponse(res, {
    statusCode: status.OK,
    message: "Carrier growth fetched successfully!",
    data: result,
  });
});

export const UserController = {
  addManager,
  blockUser,
  unblockUser,
  register,
  getAllUser,
  updateProfile,
  getAllAdmins,
  monthlyInsight,
  deleteUser,
  myProfile,
  getSingleUserById,
  userDashboardOverview,
  adminDashboardOverview,
  profileStrength,
  streakAndMilestones,
  carrierGrowth
};
