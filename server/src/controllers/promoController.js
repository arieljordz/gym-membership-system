import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import Promotion from "../models/Promotion.js";
import { recordAudit } from "../middleware/audit.js";

export const listPromos = asyncHandler(async (req, res) => {
  const isAdmin = req.user?.role === "admin";
  const filter = isAdmin && req.query.all === "true" ? {} : { status: "active" };
  const promos = await Promotion.find(filter)
    .populate("appliesToPlans", "name")
    .sort({ createdAt: -1 });
  sendSuccess(res, { data: promos });
});

export const activePromos = asyncHandler(async (_req, res) => {
  const now = new Date();
  const promos = await Promotion.find({
    status: "active",
    startDate: { $lte: now },
    endDate: { $gte: now },
  }).populate("appliesToPlans", "name");
  sendSuccess(res, { data: promos });
});

export const getPromo = asyncHandler(async (req, res) => {
  const promo = await Promotion.findById(req.params.id).populate("appliesToPlans", "name");
  if (!promo) throw ApiError.notFound("Promotion not found");
  sendSuccess(res, { data: promo });
});

export const createPromo = asyncHandler(async (req, res) => {
  const promo = await Promotion.create(req.body);
  await recordAudit({ action: "create_promo", entity: "Promotion", entityId: promo._id, req });
  sendSuccess(res, { statusCode: 201, message: "Promotion created", data: promo });
});

export const updatePromo = asyncHandler(async (req, res) => {
  const promo = await Promotion.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!promo) throw ApiError.notFound("Promotion not found");
  await recordAudit({ action: "update_promo", entity: "Promotion", entityId: promo._id, req });
  sendSuccess(res, { message: "Promotion updated", data: promo });
});

export const togglePromo = asyncHandler(async (req, res) => {
  const promo = await Promotion.findById(req.params.id);
  if (!promo) throw ApiError.notFound("Promotion not found");
  promo.status = promo.status === "active" ? "inactive" : "active";
  await promo.save();
  sendSuccess(res, { message: `Promotion set to ${promo.status}`, data: promo });
});

export const deletePromo = asyncHandler(async (req, res) => {
  const promo = await Promotion.findByIdAndDelete(req.params.id);
  if (!promo) throw ApiError.notFound("Promotion not found");
  await recordAudit({ action: "delete_promo", entity: "Promotion", entityId: req.params.id, req });
  sendSuccess(res, { message: "Promotion deleted" });
});
