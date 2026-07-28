import status from "http-status";
import ApiError from "../../app/errors/ApiError";
import { hashPassword } from "../user/user.helper";
import { createToken } from "./auth.halper";
import prisma from "../../lib/prisma";
import config from "../../config";
import { comparePassword } from "../../shared/utils/comparePassword";
import { sendOTP } from "../../shared/utils/sendOTP";
import axios from "axios"
import { User } from "@prisma/client";
import crypto from 'crypto';
import stripe from "../../infrastructure/stripe/stripe";

const verifyOTP = async (email: string, otp: string) => {
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
  await prisma.$transaction([
    prisma.oTP.delete({
      where: { id: savedOtp.id },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true },
    }),
  ]);

  const jwtPayload = {
    id: user.id,
    fullName: user.fullName ?? undefined,
    email: user.email,
    profileImage: user.profileImage,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt.access_token_secret as string,
    config.jwt.access_token_expires_in as string
  );
  const refreshToken = createToken(
    jwtPayload,
    config.jwt.refresh_token_secret as string,
    config.jwt.refresh_token_expires_in as string
  );
  return {
    accessToken,
    refreshToken,
  }
};

const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      mentorProfile: true
    }
  });

  if (!user) {
    throw new ApiError(status.NOT_FOUND, "User not found!");
  }

  if (!user.isEmailVerified) {
    throw new ApiError(status.FORBIDDEN, "Email is not verified!");
  }

  const isPasswordMatched = await comparePassword(password, user.password ?? "");

  if (!isPasswordMatched) {
    throw new ApiError(status.UNAUTHORIZED, "Password is incorrect!");
  }

  // // if user is a mentor
  // if (user.mentorProfile) {
  //   await prisma.mentorProfile.update({
  //     where:{
  //       userId:user.id
  //     },
  //     data:{

  //     }
  //   })
  // }

  const jwtPayload = {
    id: user.id,
    fullName: user.fullName ?? undefined,
    email: user.email,
    profileImage: user.profileImage,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt.access_token_secret as string,
    config.jwt.access_token_expires_in as string
  );
  const refreshToken = createToken(
    jwtPayload,
    config.jwt.refresh_token_secret as string,
    config.jwt.refresh_token_expires_in as string
  );
  // update last login
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    }),
    prisma.mentorProfile.updateMany({
      where: { userId: user.id },
      data: { lastLogin: new Date() }
    })
  ]);
  return {
    accessToken,
    refreshToken,
    isOnboarded: user.isOnboarded
  }
};

const changePassword = async (
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
};

const forgotPassword = async (email: string) => {
  console.log("here")
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new ApiError(status.NOT_FOUND, "User not found!");
  }
  // Step 1: send otp
  const res = await sendOTP(user.id);
  return {
    message: res.message
  }
};

const resetPassword = async (
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
};

const resendOtp = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new ApiError(status.NOT_FOUND, "User not found!");
  }

  await sendOTP(user.id)
  return {
    message: "New OTP has been sent to your email.",
  };
};

// LinkedIn Login - Get Authorization URL
const getLinkedInAuthUrl = () => {
  console.log('CONFIG REDIRECT URI:', config.linkedin.redirect_uri);
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.linkedin.client_id as string,
    redirect_uri: config.linkedin.redirect_uri as string,
    scope: 'openid profile email',
    state: Math.random().toString(36).substring(7), // CSRF protection
  });
  console.log("redirecturl", params.toString())


  return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
};

const linkedInCallback = async (code: string) => {
  console.log("code", code)
  try {
    const tokenResponse = await axios.post(
      'https://www.linkedin.com/oauth/v2/accessToken',
      null,
      {
        params: {
          grant_type: 'authorization_code',
          code,
          client_id: config.linkedin.client_id,
          client_secret: config.linkedin.client_secret,
          redirect_uri: config.linkedin.redirect_uri,
        },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    const profileResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const linkedInUser = profileResponse.data;

    let user = await prisma.user.findUnique({ where: { email: linkedInUser.email } });
    const isNewUser = !user; // track if new

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: linkedInUser.email,
          fullName: linkedInUser.name || `${linkedInUser.given_name} ${linkedInUser.family_name}`,
          profileImage: linkedInUser.picture || null,
          role: 'USER',
          isEmailVerified: true,
        },
      });
    } else {
      user = await prisma.user.update({
        where: { email: linkedInUser.email },
        data: {
          fullName: linkedInUser.name || user.fullName,
          profileImage: linkedInUser.picture || user.profileImage,
        },
      });
    }

    // update last login
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      }),
      prisma.mentorProfile.updateMany({
        where: { userId: user.id },
        data: { lastLogin: new Date() }
      })
    ]);

    // New user — create Stripe customer
    if (isNewUser) {
      try {
        const stripeCustomer = await stripe.customers.create({
          email: user.email,
          name: user.fullName,
          metadata: { userId: user.id },
        });

        await prisma.user.update({
          where: { id: user.id },
          data: { stripeCustomerId: stripeCustomer.id },
        });
      } catch (err) {
        console.error("Stripe customer creation failed:", err);
      }
    }

    const jwtPayload = {
      id: user.id,
      fullName: user.fullName ?? undefined,
      email: user.email,
      profileImage: user.profileImage,
      role: user.role,
    };

    const accessTokenJWT = createToken(jwtPayload, config.jwt.access_token_secret as string, config.jwt.access_token_expires_in as string);
    const refreshToken = createToken(jwtPayload, config.jwt.refresh_token_secret as string, config.jwt.refresh_token_expires_in as string);

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
};

const googleLogin = async (payload: Partial<User>) => {
  const { fullName, email } = payload;

  if (!email) throw new ApiError(status.BAD_REQUEST, "Google account has no email");
  if (!fullName) throw new ApiError(status.BAD_REQUEST, "Google account has no name");

  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        fullName,
        email,
        password: crypto.randomBytes(6).toString('hex'),
        lastLogin: new Date(),
        isEmailVerified: true,
      }
    });

    // New user — create Stripe customer
    try {
      const stripeCustomer = await stripe.customers.create({
        email: user.email,
        name: user.fullName,
        metadata: { userId: user.id },
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: stripeCustomer.id },
      });
    } catch (err) {
      console.error("Stripe customer creation failed:", err);
    }
  }

  // update last login
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user!.id },
      data: { lastLogin: new Date() }
    }),
    prisma.mentorProfile.updateMany({
      where: { userId: user!.id },
      data: { lastLogin: new Date() }
    })
  ]);

  if (user?.isBlocked) throw new ApiError(status.FORBIDDEN, 'User is blocked');

  const jwtPayload = {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
  };

  const accessToken = createToken(jwtPayload, config.jwt.access_token_secret as string, config.jwt.access_token_expires_in as string);
  const refreshToken = createToken(jwtPayload, config.jwt.refresh_token_secret as string, config.jwt.refresh_token_expires_in as string);

  return { accessToken, refreshToken, isOnboarded: user.isOnboarded };
};

export const AuthService = {
  verifyOTP,
  loginUser,
  changePassword,
  forgotPassword,
  resetPassword,
  resendOtp,
  getLinkedInAuthUrl,
  linkedInCallback,
  googleLogin,
};
