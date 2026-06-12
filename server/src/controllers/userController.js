import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { sendSuccess, paginate } from "../utils/ApiResponse.js";
import User from "../models/User.js";
import { recordAudit } from "../middleware/audit.js";

export const getMe = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: { user: req.user } })
);

export const updateMe = asyncHandler(async (req, res) => {
  const allowed = ["firstName", "lastName", "gender", "birthdate", "contactNumber", "address", "avatar"];
  allowed.forEach((f) => {
    if (req.body[f] !== undefined) req.user[f] = req.body[f];
  });
  await req.user.save();
  sendSuccess(res, { message: "Profile updated", data: { user: req.user } });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.comparePassword(currentPassword))) {
    throw ApiError.badRequest("Current password is incorrect");
  }
  user.password = newPassword;
  await user.save();
  sendSuccess(res, { message: "Password changed successfully" });
});

// ===== Admin =====
export const listUsers = asyncHandler(async (req, res) => {
  const { role, search, status } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { firstName: new RegExp(search, "i") },
      { lastName: new RegExp(search, "i") },
      { email: new RegExp(search, "i") },
    ];
  }
  const { skip, limit, page } = paginate(req.query, req.query);
  const [items, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);
  sendSuccess(res, {
    data: items,
    meta: { total, page, limit, pages: Math.ceil(total / limit) },
  });
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound("User not found");
  sendSuccess(res, { data: { user } });
});

export const updateUser = asyncHandler(async (req, res) => {
  const { role, status } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound("User not found");
  if (role) user.role = role;
  if (status) user.status = status;
  await user.save();
  await recordAudit({ action: "update_user", entity: "User", entityId: user._id, meta: { role, status }, req });
  sendSuccess(res, { message: "User updated", data: { user } });
});

export const deleteUser = asyncHandler(async (req, res) => {
  if (String(req.params.id) === String(req.user._id)) {
    throw ApiError.badRequest("You cannot delete your own account");
  }
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw ApiError.notFound("User not found");
  await recordAudit({ action: "delete_user", entity: "User", entityId: req.params.id, req });
  sendSuccess(res, { message: "User deleted" });
});
