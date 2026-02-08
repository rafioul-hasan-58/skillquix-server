import status from "http-status";
import ApiError from "../../errors/ApiError";
import { hashPassword } from "../user/user.utils";
import { createToken } from "./auth.utils";
import prisma from "../../lib/prisma";
import config from "../../../config";
import { comparePassword } from "../../utils/comparePassword";
import { sendOTP } from "../../utils/sendOTP";


export const AuthService = {
  verifyOTP: async (email: string, otp: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new ApiError(status.NOT_FOUND, "User not found!");
    }
    const savedOtp = await prisma.oTP.findUnique({ where: { userId: user.id } })

    if (!savedOtp) {
      throw new ApiError(status.BAD_REQUEST, "OTP Not found!");
    }

    if (savedOtp.otpExpiresAt! < new Date()) {
      throw new ApiError(status.BAD_REQUEST, "OTP has expired!");
    }

    if (Number(savedOtp.otpCode) !== Number(otp)) {
      throw new ApiError(status.BAD_REQUEST, "OTP not matched!");
    }

    // update database
    await prisma.oTP.delete({
      where: { id: savedOtp.id },
    });

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
    return {
      accessToken
    }
  },

  loginUser: async (email: string, password: string) => {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new ApiError(status.NOT_FOUND, "User not found!");
    }

    const isPasswordMatched = await comparePassword(password, user.password ?? "");

    if (!isPasswordMatched) {
      throw new ApiError(status.UNAUTHORIZED, "Password is incorrect!");
    }


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
  changePassword: async (
    email: string,
    currentPassword: string,
    newPassword: string
  ) => {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new ApiError(status.NOT_FOUND, "User not found!");
    }

    const isPasswordMatch = await comparePassword(currentPassword, user.password ?? "");

    if (!isPasswordMatch) {
      throw new ApiError(status.UNAUTHORIZED, "Current password is incorrect!");
    }

    const hashedNewPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { email },
      data: {
        password: hashedNewPassword
      },
    });

    return null;
  },
  forgotPassword: async (email: string) => {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new ApiError(status.NOT_FOUND, "User not found!");
    }

    // Step 1: Generate OTP
    const res = await sendOTP(user.id);
    return {
      message: res.message
    }
  },

  resetPassword: async (
    email: string,
    newPassword: string,
    confirmPassword: string
  ) => {
    if (newPassword !== confirmPassword) {
      throw new ApiError(status.BAD_REQUEST, "Passwords do not match!");
    }

    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      throw new ApiError(status.NOT_FOUND, "User not found!");
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { email: email },
      data: {
        password: hashedPassword,
      },
    });

    return {
      message: "Password reset successfully!",
    };
  },

  resendOtp: async (email: string) => {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new ApiError(status.NOT_FOUND, "User not found!");
    }

    await sendOTP(user.id)
    return {
      message: "New OTP has been sent to your email for reset password.",
    };
  }

};
