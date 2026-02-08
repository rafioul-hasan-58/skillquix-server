import status from "http-status";
import { AuthService } from "./auth.service";
import catchAsync from "../../helpers/catchAsync";
import { Request, Response } from "express";
import sendResponse from "../../helpers/sendResponse";
import ApiError from "../../errors/ApiError";
import config from "../../../config";



export const AuthController = {

  verifyOTP: catchAsync(async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    const result = await AuthService.verifyOTP(email, otp);
    sendResponse(res, {
      success: true,
      statusCode: status.OK,
      message: "OTP verified successfully!",
      data: result,
    });
  }),

  login: catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const { accessToken, refreshToken } = await AuthService.loginUser(email, password);
    res.cookie("refreshToken", refreshToken, {
      secure: false,
      httpOnly: true,
    });
    sendResponse(res, {
      success: true,
      statusCode: status.OK,
      message: "User Logged In successfully!",
      data: {
        accessToken
      },

    });
  }),

  changePassword: catchAsync(async (req, res) => {
    const email = req.user?.email as string;
    const { currentPassword, newPassword } = req.body;
    await AuthService.changePassword(email, currentPassword, newPassword);
    sendResponse(res, {
      success: true,
      statusCode: status.OK,
      message: "User password changed successfully!",
    });
  }),

  forgotPassword: catchAsync(async (req, res) => {
    const { email } = req.body;
    const result = await AuthService.forgotPassword(email);
    sendResponse(res, {
      success: true,
      statusCode: status.OK,
      message: result.message,
      data: result,
    });
  }),
  resetPassword: catchAsync(async (req, res) => {
    const { newPassword, confirmPassword } = req.body;
    const { email } = req.user;
    const result = await AuthService.resetPassword(
      email,
      newPassword,
      confirmPassword
    );

    sendResponse(res, {
      statusCode: status.OK,
      message: result.message,
    });
  }),

  resendOTP: catchAsync(async (req, res) => {
    const { email } = req.body;

    const result = await AuthService.resendOtp(email);

    sendResponse(res, {
      statusCode: status.OK,
      message: result.message,
    });
  }),
  // Initiate LinkedIn OAuth
  linkedInLogin: catchAsync(async (req: Request, res: Response) => {
    const authUrl = AuthService.getLinkedInAuthUrl();

    sendResponse(res, {
      success: true,
      statusCode: status.OK,
      message: "LinkedIn authorization URL generated",
      data: {
        authUrl
      },
    });
  }),

  // Handle LinkedIn callback
  linkedInCallback: catchAsync(async (req: Request, res: Response) => {
    const { code } = req.query;

    if (!code || typeof code !== 'string') {
      throw new ApiError(status.BAD_REQUEST, "Authorization code is required");
    }

    const { accessToken, refreshToken, user } = await AuthService.linkedInCallback(code);

    // Set refresh token in cookie
    res.cookie("refreshToken", refreshToken, {
      secure: config.env === 'production', // true in production
      httpOnly: true,
      sameSite: 'lax',
    });
    const frontend_url = "http://localhost:3000"
    // Option 1: Redirect with token in URL (less secure but simpler)
    res.redirect(`${frontend_url}/auth/callback?token=${accessToken}`);
  }),

};
