import { verifyAccessToken } from "../utils/token.js";
import User from "../models/User.js";

// Attaches req.user when a valid token is present, but never blocks the request.
export const optionalAuth = async (req, _res, next) => {
  try {
    const header = req.headers.authorization;
    let token;
    if (header?.startsWith("Bearer ")) token = header.split(" ")[1];
    else if (req.cookies?.accessToken) token = req.cookies.accessToken;
    if (token) {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.sub);
      if (user) req.user = user;
    }
  } catch {
    /* ignore invalid tokens for optional auth */
  }
  next();
};

export default optionalAuth;
