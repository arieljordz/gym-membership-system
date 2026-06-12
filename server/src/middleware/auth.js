import { verifyAccessToken } from "../utils/token.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/User.js";

export const protect = asyncHandler(async (req, res, next) => {
  let token;
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) token = header.split(" ")[1];
  else if (req.cookies?.accessToken) token = req.cookies.accessToken;

  if (!token) throw ApiError.unauthorized("Authentication required");

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch {
    throw ApiError.unauthorized("Invalid or expired access token");
  }

  const user = await User.findById(decoded.sub);
  if (!user) throw ApiError.unauthorized("User no longer exists");
  if (user.status === "disabled") throw ApiError.forbidden("Account is disabled");

  req.user = user;
  next();
});

export default protect;
