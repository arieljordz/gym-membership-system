import { ApiError } from "../utils/ApiError.js";

// Usage: router.get("/", protect, authorize("admin", "staff"), handler)
export const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return next(ApiError.unauthorized());
  if (roles.length && !roles.includes(req.user.role)) {
    return next(ApiError.forbidden("You do not have permission to perform this action"));
  }
  next();
};

export default authorize;
