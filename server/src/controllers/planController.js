import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import MembershipPlan from "../models/MembershipPlan.js";
import { recordAudit } from "../middleware/audit.js";

export const listPlans = asyncHandler(async (req, res) => {
  const isAdmin = req.user?.role === "admin";
  const filter = isAdmin && req.query.all === "true" ? {} : { isActive: true };
  const plans = await MembershipPlan.find(filter).sort({ price: 1 });
  sendSuccess(res, { data: plans });
});

export const getPlan = asyncHandler(async (req, res) => {
  const plan = await MembershipPlan.findById(req.params.id);
  if (!plan) throw ApiError.notFound("Plan not found");
  sendSuccess(res, { data: plan });
});

export const createPlan = asyncHandler(async (req, res) => {
  const plan = await MembershipPlan.create(req.body);
  await recordAudit({ action: "create_plan", entity: "MembershipPlan", entityId: plan._id, req });
  sendSuccess(res, { statusCode: 201, message: "Plan created", data: plan });
});

export const updatePlan = asyncHandler(async (req, res) => {
  const plan = await MembershipPlan.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!plan) throw ApiError.notFound("Plan not found");
  await recordAudit({ action: "update_plan", entity: "MembershipPlan", entityId: plan._id, req });
  sendSuccess(res, { message: "Plan updated", data: plan });
});

export const togglePlan = asyncHandler(async (req, res) => {
  const plan = await MembershipPlan.findById(req.params.id);
  if (!plan) throw ApiError.notFound("Plan not found");
  plan.isActive = !plan.isActive;
  await plan.save();
  sendSuccess(res, {
    message: `Plan ${plan.isActive ? "activated" : "deactivated"}`,
    data: plan,
  });
});

export const deletePlan = asyncHandler(async (req, res) => {
  const plan = await MembershipPlan.findByIdAndDelete(req.params.id);
  if (!plan) throw ApiError.notFound("Plan not found");
  await recordAudit({ action: "delete_plan", entity: "MembershipPlan", entityId: req.params.id, req });
  sendSuccess(res, { message: "Plan deleted" });
});
