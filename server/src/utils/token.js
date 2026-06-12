import jwt from "jsonwebtoken";
import crypto from "crypto";
import env from "../config/env.js";

export const signAccessToken = (payload) =>
  jwt.sign(payload, env.jwt.accessSecret, { expiresIn: env.jwt.accessExpires });

export const signRefreshToken = (payload) =>
  jwt.sign(payload, env.jwt.refreshSecret, { expiresIn: env.jwt.refreshExpires });

export const verifyAccessToken = (token) => jwt.verify(token, env.jwt.accessSecret);
export const verifyRefreshToken = (token) => jwt.verify(token, env.jwt.refreshSecret);

// Opaque tokens for email verification / password reset.
export const randomToken = (bytes = 32) => crypto.randomBytes(bytes).toString("hex");
export const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");
