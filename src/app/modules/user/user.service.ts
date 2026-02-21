import status from "http-status";
import { hashPassword } from "./user.utils";
import ApiError from "../../errors/ApiError";
import { User } from "@prisma/client";
import prisma from "../../lib/prisma";
import QueryBuilder from "../../builder/QueryBuilder";
import { createToken } from "../auth/auth.utils";
import config from "../../../config";


export const UserService = {
  register: async (payload: User) => {
    const isUserExist = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (isUserExist) {
      throw new ApiError(status.BAD_REQUEST, "User already exists");
    }

    const hashedPassword = await hashPassword(payload.password ?? "");
    const userData = {
      ...payload,
      password: hashedPassword
    };

    const user = await prisma.user.create({
      data: userData
    })
    const jwtPayload = {
      id: user.id,
      fullName: user.fullName ?? undefined,
      email: user.email,
      profileImage: user.profileImage,
      role: user.role,
    };

    const accessToken = createToken(
      jwtPayload,
      config.jwt.access_secret as string,
      config.jwt.access_expires_in as string
    );
    console.log("refresh", config.jwt.refresh_token_secret)
    const refreshToken = createToken(
      jwtPayload,
      config.jwt.refresh_token_secret as string,
      config.jwt.refresh_token_expires_in as string
    );
    return {
      accessToken,
      refreshToken
    }
  },

  getAllUserFromDB: async (query: Record<string, unknown>) => {
    const userQuery = new QueryBuilder(prisma.user, query)
      .search(["fullName", "email"])
      .filter()
      .paginate()
      .select({
        id: true,
        fullName: true,
        email: true,
        profileImage: true,
        isBlocked: true,
        createdAt: true,
        lastLogin: true,
        subscriptionType: true
      })

    const [result, meta] = await Promise.all([
      userQuery.execute(),
      userQuery.countTotal(),
    ]);

    if (!result.length) {
      throw new ApiError(status.NOT_FOUND, "No users found!");
    }

    // Remove password from each user
    const data = result.map((user: User) => {
      const { password, ...rest } = user;
      return rest;
    });

    return {
      meta,
      data,
    };
  },
  myProfile: async (userId: string) => {
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        profileImage: true,
        profession: true,
        role: true,
        bio: true,
        location: true,
        createdAt: true,
        updatedAt: true
      }
    });
    if (!user) {
      throw new ApiError(status.NOT_FOUND, "User not found!")
    }
    return user;
  },

  updateProfile: async (userId: string, payload: Partial<User>) => {
    const isUserExist = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!isUserExist) {
      throw new ApiError(status.NOT_FOUND, "User not found!");
    }
    if (!payload.profileImage) {
      payload.profileImage = isUserExist.profileImage;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName: payload.fullName,
        profileImage: payload.profileImage || "",
        bio: payload.bio,
        location: payload.location,
        profession: payload.profession,
        marketingEmails: payload.marketingEmails,
        jobAlerts: payload.jobAlerts,
        emailNotification: payload.emailNotification
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        profileImage: true,
        location: true,
        bio: true,
        role: true,
        marketingEmails: true,
        jobAlerts: true,
        emailNotification: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  },
  getSingleUserByIdFromDB: async (userId: string) => {
    const result = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        profession: true,
        profileImage: true,
        location: true,
        bio: true,
        createdAt: true,
        updatedAt: true
      }
    });
    if (!result) {
      throw new ApiError(status.NOT_FOUND, "User not found!");
    }
    return result
  },
  deleteUserFromDB: async (userId: string) => {
    const isUserExist = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!isUserExist) {
      throw new ApiError(status.NOT_FOUND, "User not found!");
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return null;
  },
  blockUser: async (userId: string) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new ApiError(status.NOT_FOUND, "User not found!");
    }
    if (user?.isBlocked) {
      throw new ApiError(status.NOT_FOUND, "User is Already Blocked!");
    }
    const result = await prisma.user.update({
      where: { id: userId },
      data: { isBlocked: true },
    });

    return result;
  },

  unblockUser: async (userId: string) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(status.NOT_FOUND, "User not found!");
    }

    if (user.isBlocked === false) {
      throw new ApiError(status.NOT_ACCEPTABLE, "User already unblocked!")
    }
    const result = await prisma.user.update({
      where: { id: userId },
      data: { isBlocked: false },
    });

    return result;
  },
};
