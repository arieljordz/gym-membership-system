import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import User from "../models/User.js";
import env from "../config/env.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  randomToken,
  hashToken,
} from "../utils/token.js";
import { sendEmail } from "../utils/email.js";
import { recordAudit } from "../middleware/audit.js";

const buildTokens = (user) => {
  const payload = { sub: String(user._id), role: user.role };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
};

const refreshCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: env.isProd,
  path: "/api/auth",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, gender, birthdate, contactNumber, email, address, password } =
    req.body;

  const exists = await User.findOne({ email: String(email).toLowerCase() });
  if (exists) throw ApiError.conflict("Email is already registered");

  const verifyTokenRaw = randomToken(24);
  const user = await User.create({
    firstName,
    lastName,
    gender,
    birthdate,
    contactNumber,
    email,
    address,
    password,
    emailVerificationToken: hashToken(verifyTokenRaw),
    emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  const verifyUrl = `${env.clientUrl}/verify-email?token=${verifyTokenRaw}&email=${encodeURIComponent(
    user.email
  )}`;
  
  let emailStatus = "sent";

  try {
    await sendEmail({
      to: user.email,
      subject: "Verify your Gym Membership email",
      text: `Welcome ${user.firstName}! Verify your email: ${verifyUrl}`,
      html: `<p>Welcome ${user.firstName}!</p><p>Please verify your email:</p><a href="${verifyUrl}">${verifyUrl}</a>`,
    });
  } catch (err) {
    emailStatus = "failed";
    console.error("Email sending failed:", err);
  }
  await recordAudit({ actor: user._id, action: "register", entity: "User", entityId: user._id, req });

  sendSuccess(res, {
    statusCode: 201,
    message: "Registration successful. Please verify your email.",
    data: { user, verifyUrl: env.isProd ? undefined : verifyUrl, emailStatus },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: String(email).toLowerCase() }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized("Invalid email or password");
  }
  if (user.status === "disabled") throw ApiError.forbidden("Account is disabled");

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const { accessToken, refreshToken } = buildTokens(user);
  res.cookie("refreshToken", refreshToken, refreshCookieOptions);

  sendSuccess(res, {
    message: "Login successful",
    data: { user: user.toJSON(), accessToken, refreshToken },
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!token) throw ApiError.unauthorized("No refresh token provided");

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw ApiError.unauthorized("Invalid or expired refresh token");
  }

  const user = await User.findById(decoded.sub);
  if (!user) throw ApiError.unauthorized("User not found");

  const { accessToken, refreshToken } = buildTokens(user);
  res.cookie("refreshToken", refreshToken, refreshCookieOptions);
  sendSuccess(res, { message: "Token refreshed", data: { accessToken, refreshToken } });
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie("refreshToken", { ...refreshCookieOptions, maxAge: undefined });
  sendSuccess(res, { message: "Logged out successfully" });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { token, email } = req.body;
  const user = await User.findOne({ email: String(email).toLowerCase() }).select(
    "+emailVerificationToken +emailVerificationExpires"
  );
  if (!user) throw ApiError.badRequest("Invalid verification link");
  if (user.isEmailVerified) return sendSuccess(res, { message: "Email already verified" });

  if (
    !user.emailVerificationToken ||
    user.emailVerificationToken !== hashToken(token) ||
    user.emailVerificationExpires < new Date()
  ) {
    throw ApiError.badRequest("Verification link is invalid or has expired");
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });
  sendSuccess(res, { message: "Email verified successfully" });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: String(email).toLowerCase() });
  if (user) {
    const raw = randomToken(24);
    user.passwordResetToken = hashToken(raw);
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save({ validateBeforeSave: false });
    const resetUrl = `${env.clientUrl}/reset-password?token=${raw}&email=${encodeURIComponent(
      user.email
    )}`;
    await sendEmail({
      to: user.email,
      subject: "Reset your Gym Membership password",
      text: `Reset your password: ${resetUrl}`,
      html: `<p>Reset your password (valid 1 hour):</p><a href="${resetUrl}">${resetUrl}</a>`,
    });
  }
  sendSuccess(res, { message: "If that email exists, a reset link has been sent." });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, email, password } = req.body;
  const user = await User.findOne({ email: String(email).toLowerCase() }).select(
    "+passwordResetToken +passwordResetExpires +password"
  );
  if (
    !user ||
    !user.passwordResetToken ||
    user.passwordResetToken !== hashToken(token) ||
    user.passwordResetExpires < new Date()
  ) {
    throw ApiError.badRequest("Reset link is invalid or has expired");
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  sendSuccess(res, { message: "Password reset successful. You can now log in." });
});
