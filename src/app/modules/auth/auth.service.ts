import status from "http-status";
import ApiError from "../../errors/ApiError";
import { hashPassword } from "../user/user.utils";
import { createToken } from "./auth.utils";
import prisma from "../../lib/prisma";
import config from "../../../config";
import { comparePassword } from "../../utils/comparePassword";
import { sendOTP } from "../../utils/sendOTP";
import axios from "axios"
import { User } from "@prisma/client";
import crypto from 'crypto';

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
  },

  // LinkedIn Login - Get Authorization URL
  getLinkedInAuthUrl: () => {
      console.log('CONFIG REDIRECT URI:', config.linkedin.redirect_uri);
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.linkedin.client_id as string,
      redirect_uri: config.linkedin.redirect_uri as string,
      scope: 'openid profile email',
      state: Math.random().toString(36).substring(7), // CSRF protection
    });

    return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
  },

  // LinkedIn Callback - Exchange code for token and get user data
  linkedInCallback: async (code: string) => {
    try {
      // Step 1: Exchange authorization code for access token
      const tokenResponse = await axios.post(
        'https://www.linkedin.com/oauth/v2/accessToken',
        null,
        {
          params: {
            grant_type: 'authorization_code',
            code: code,
            client_id: config.linkedin.client_id,
            client_secret: config.linkedin.client_secret,
            redirect_uri: config.linkedin.redirect_uri,
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const accessToken = tokenResponse.data.access_token;

      // Step 2: Get user profile from LinkedIn
      const profileResponse = await axios.get(
        'https://api.linkedin.com/v2/userinfo',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const linkedInUser = profileResponse.data;

      // Step 3: Check if user exists in database
      let user = await prisma.user.findUnique({
        where: { email: linkedInUser.email },
      });

      // Step 4: If user doesn't exist, create new user
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: linkedInUser.email,
            fullName: linkedInUser.name || `${linkedInUser.given_name} ${linkedInUser.family_name}`,
            profileImage: linkedInUser.picture || null,
            role: 'USER', // or whatever your default role is
            // Note: No password since it's OAuth login
          },
        });
      } else {
        // Optionally update user info from LinkedIn
        user = await prisma.user.update({
          where: { email: linkedInUser.email },
          data: {
            fullName: linkedInUser.name || user.fullName,
            profileImage: linkedInUser.picture || user.profileImage,
          },
        });
      }

      // Step 5: Generate JWT tokens
      const jwtPayload = {
        id: user.id,
        fullName: user.fullName ?? undefined,
        email: user.email,
        profileImage: user.profileImage,
        role: user.role,
      };

      const accessTokenJWT = createToken(
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
        accessToken: accessTokenJWT,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          profileImage: user.profileImage,
          role: user.role,
        },
      };
    } catch (error: any) {
      console.error('LinkedIn OAuth Error:', error.response?.data || error.message);
      throw new ApiError(
        status.UNAUTHORIZED,
        error.response?.data?.error_description || 'LinkedIn authentication failed'
      );
    }
  },
  googleLogin: async (payload: Partial<User>, sessionId: string) => {
    const { fullName, email } = payload;
    let user = await prisma.user.findUnique({
      where: {
        email
      }
    });

    if (!email) {
      throw new ApiError(status.BAD_REQUEST, "Google account has no email");
    }
    if (!fullName) {
      throw new ApiError(status.BAD_REQUEST, "Google account has no name");
    }

    if (!user) {
      user = await prisma.user.create({
        data: {
          fullName,
          email,
          password: crypto.randomBytes(6).toString('hex'),
          lastActive: new Date(),
        }
      })
    }
    if (user?.isBlocked) {
      throw new ApiError(status.FORBIDDEN, 'User is blocked')
    }

    const jwtPayload = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role
    }
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
};
