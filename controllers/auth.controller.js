// import asyncHandler from "express-async-handler";
// import authService from "../services/auth.service.js";
// import otpService from "../services/otp.service.js";
// import {
//   validateUserRegistration,
//   validateLogin,
//   validateOTPRequest,
//   validateOTPVerification,
// } from "../utils/validators.js";

// /**
//  * @desc    Register new user & automatically dispatch verification OTP
//  * @route   POST /api/auth/register
//  */
// export const registerUser = asyncHandler(async (req, res) => {
//   const { error } = validateUserRegistration(req.body);
//   if (error) {
//     return res
//       .status(400)
//       .json({ success: false, message: error.details[0].message });
//   }

//   // 1. Register the user (defaults to isEmailVerified: false)
//   const user = await authService.register(req.body);

//   // 2. Dispatch OTP to user's registered email
//   await otpService.sendVerificationOTP(user.email);

//   res.status(201).json({
//     success: true,
//     message:
//       "User registered successfully! Please check your email for the verification OTP.",
//     user: {
//       id: user._id,
//       fullName: user.fullName,
//       email: user.email,
//       phone: user.phone,
//       isEmailVerified: false,
//     },
//   });
// });

// /**
//  * @desc    Login user (blocked if email is unverified)
//  * @route   POST /api/auth/login
//  */
// export const loginUser = asyncHandler(async (req, res) => {
//   const { error } = validateLogin(req.body);
//   if (error) {
//     return res
//       .status(400)
//       .json({ success: false, message: error.details[0].message });
//   }

//   const result = await authService.login(req.body.email, req.body.password);

//   // Block login if email is not verified
//   if (result.user && !result.user.isEmailVerified) {
//     return res.status(403).json({
//       success: false,
//       message:
//         "Your email address is not verified. Please verify your email with OTP before logging in.",
//       requiresVerification: true,
//       email: result.user.email,
//     });
//   }

//   res.json({ success: true, message: "✅ Login successful", ...result });
// });

// /**
//  * @desc    Verify OTP and update user's email verification status
//  * @route   POST /api/auth/verify-otp
//  */
// export const verifyOTP = asyncHandler(async (req, res) => {
//   const { error } = validateOTPVerification(req.body);
//   if (error) {
//     return res
//       .status(400)
//       .json({ success: false, message: error.details[0].message });
//   }

//   const { email, otp } = req.body;

//   // 1. Verify OTP validity
//   const verification = await otpService.verifyOTP(email, otp);
//   if (!verification.isValid) {
//     return res.status(400).json({
//       success: false,
//       message: verification.message,
//     });
//   }

//   // 2. Mark user as verified in database
//   const updatedUser = await authService.markEmailAsVerified(email);

//   res.status(200).json({
//     success: true,
//     message: "Email verified successfully! You can now log in.",
//     user: updatedUser,
//   });
// });

// /**
//  * @desc    Resend / Request Email Verification OTP
//  * @route   POST /api/auth/send-otp
//  */
// export const sendOTP = asyncHandler(async (req, res) => {
//   const { error } = validateOTPRequest(req.body);
//   if (error) {
//     return res
//       .status(400)
//       .json({ success: false, message: error.details[0].message });
//   }

//   const { email } = req.body;
//   const result = await otpService.sendVerificationOTP(email);

//   res.status(200).json({
//     success: true,
//     message: result.message || "Verification OTP sent successfully.",
//   });
// });

// /**
//  * @desc    Refresh JWT Access Token
//  * @route   POST /api/auth/refresh-token
//  */
// export const refreshToken = asyncHandler(async (req, res) => {
//   const result = await authService.refreshToken(req.body.refreshToken);
//   res.json({ success: true, ...result });
// });

// /**
//  * @desc    Logout user & revoke refresh token
//  * @route   POST /api/auth/logout
//  */
// export const logoutUser = asyncHandler(async (req, res) => {
//   await authService.logout(req.body.refreshToken);
//   res.json({
//     success: true,
//     message: "Logged out successfully. Refresh token revoked.",
//   });
// });

import asyncHandler from "express-async-handler";
import authService from "../services/auth.service.js";
import otpService from "../services/otp.service.js";
import {
  validateUserRegistration,
  validateLogin,
  validateOTPRequest,
  validateOTPVerification,
} from "../utils/validators.js";

/**
 * @desc    Register new user & automatically dispatch verification OTP
 * @route   POST /api/auth/register
 */
export const registerUser = asyncHandler(async (req, res) => {
  const { error } = validateUserRegistration(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  // 1. Register the user (or, if an unverified account already exists for
  //    this email, refresh its details instead of rejecting the request)
  const { user, isNewRegistration } = await authService.register(req.body);

  // 2. Dispatch a fresh verification OTP to the user's email either way
  await otpService.sendVerificationOTP(user.email);

  if (!isNewRegistration) {
    return res.status(200).json({
      success: true,
      message: "Verification email sent again. Please verify your email.",
    });
  }

  res.status(201).json({
    success: true,
    message:
      "User registered successfully! Please check your email for the verification OTP.",
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      isEmailVerified: false,
    },
  });
});

/**
 * @desc    Login user (blocked if email is unverified)
 * @route   POST /api/auth/login
 */
export const loginUser = asyncHandler(async (req, res) => {
  const { error } = validateLogin(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  const result = await authService.login(req.body.email, req.body.password);

  // Block login if email is not verified
  if (result.user && !result.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message:
        "Your email address is not verified. Please verify your email with OTP before logging in.",
      requiresVerification: true,
      email: result.user.email,
    });
  }

  res.json({ success: true, message: "✅ Login successful", ...result });
});

/**
 * @desc    Verify OTP and update user's email verification status
 * @route   POST /api/auth/verify-otp
 */
export const verifyOTP = asyncHandler(async (req, res) => {
  const { error } = validateOTPVerification(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  const { email, otp } = req.body;

  // 1. Verify OTP validity
  const verification = await otpService.verifyOTP(email, otp);
  if (!verification.isValid) {
    return res.status(400).json({
      success: false,
      message: verification.message,
    });
  }

  // 2. Mark user as verified in database
  const updatedUser = await authService.markEmailAsVerified(email);

  res.status(200).json({
    success: true,
    message: "Email verified successfully! You can now log in.",
    user: updatedUser,
  });
});

/**
 * @desc    Resend / Request Email Verification OTP
 * @route   POST /api/auth/send-otp
 */
export const sendOTP = asyncHandler(async (req, res) => {
  const { error } = validateOTPRequest(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  const { email } = req.body;
  const result = await otpService.sendVerificationOTP(email);

  res.status(200).json({
    success: true,
    message: result.message || "Verification OTP sent successfully.",
  });
});

/**
 * @desc    Refresh JWT Access Token
 * @route   POST /api/auth/refresh-token
 */
export const refreshToken = asyncHandler(async (req, res) => {
  const result = await authService.refreshToken(req.body.refreshToken);
  res.json({ success: true, ...result });
});

/**
 * @desc    Logout user & revoke refresh token
 * @route   POST /api/auth/logout
 */
export const logoutUser = asyncHandler(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.json({
    success: true,
    message: "Logged out successfully. Refresh token revoked.",
  });
});
