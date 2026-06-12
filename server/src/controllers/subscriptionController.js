import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { sendSuccess, paginate } from "../utils/ApiResponse.js";
import Subscription from "../models/Subscription.js";
import MembershipPlan from "../models/MembershipPlan.js";
import Promotion from "../models/Promotion.js";
import QRPass from "../models/QRPass.js";
import { findBestPromoForPlan, computePricing } from "../services/membershipService.js";

export const createSubscription = asyncHandler(async (req, res) => {
  const { planId, promoId, promoCode } = req.body;

  const plan = await MembershipPlan.findOne({ _id: planId, isActive: true });
  if (!plan) throw ApiError.notFound("Plan not found or inactive");

  const existingPending = await Subscription.findOne({ member: req.user._id, status: "pending" });
  if (existingPending) {
    throw ApiError.conflict("You already have a pending subscription. Complete or cancel it first.");
  }

  let promo = null;
  if (promoId) promo = await Promotion.findById(promoId);
  else if (promoCode) promo = await Promotion.findOne({ code: String(promoCode).toUpperCase() });
  else promo = await findBestPromoForPlan(plan._id);

  if (promo) {
    const now = new Date();
    const live = promo.status === "active" && promo.startDate <= now && promo.endDate >= now;
    const applies =
      !promo.appliesToPlans?.length ||
      promo.appliesToPlans.map(String).includes(String(plan._id));
    if (!live || !applies) {
      if (promoId || promoCode) throw ApiError.badRequest("Selected promo is not valid for this plan");
      promo = null;
    }
  }

  const { basePrice, discountAmount, finalPrice } = computePricing(plan, promo);
  const sub = await Subscription.create({
    member: req.user._id,
    plan: plan._id,
    promo: promo?._id || null,
    basePrice,
    discountAmount,
    finalPrice,
    status: "pending",
  });

  await sub.populate(["plan", "promo"]);
  sendSuccess(res, {
    statusCode: 201,
    message: "Subscription created. Submit payment to activate.",
    data: sub,
  });
});

export const listMySubscriptions = asyncHandler(async (req, res) => {
  const subs = await Subscription.find({ member: req.user._id })
    .populate("plan")
    .populate("promo")
    .sort({ createdAt: -1 });
  sendSuccess(res, { data: subs });
});

export const getMyMembership = asyncHandler(async (req, res) => {
  const sub = await Subscription.findOne({
    member: req.user._id,
    status: "active",
    endDate: { $gte: new Date() },
  })
    .populate("plan")
    .populate("promo")
    .sort({ endDate: -1 });

  const qrPass = sub ? await QRPass.findOne({ subscription: sub._id }) : null;
  sendSuccess(res, { data: { subscription: sub, qrPass } });
});

export const cancelSubscription = asyncHandler(async (req, res) => {
  const sub = await Subscription.findById(req.params.id);
  if (!sub) throw ApiError.notFound("Subscription not found");

  const isOwner = String(sub.member) === String(req.user._id);
  if (!isOwner && req.user.role !== "admin") throw ApiError.forbidden();
  if (["expired", "cancelled"].includes(sub.status)) {
    throw ApiError.badRequest("Subscription is already closed");
  }
  sub.status = "cancelled";
  await sub.save();
  sendSuccess(res, { message: "Subscription cancelled", data: sub });
});

// ===== Admin =====
export const listSubscriptions = asyncHandler(async (req, res) => {
  const { status, member } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (member) filter.member = member;

  const { skip, limit, page } = paginate(req.query, req.query);
  const [items, total] = await Promise.all([
    Subscription.find(filter)
      .populate("member", "firstName lastName email")
      .populate("plan", "name price durationDays")
      .populate("promo", "promoName discountPercentage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Subscription.countDocuments(filter),
  ]);
  sendSuccess(res, { data: items, meta: { total, page, limit, pages: Math.ceil(total / limit) } });
});

export const getSubscription = asyncHandler(async (req, res) => {
  const sub = await Subscription.findById(req.params.id)
    .populate("member", "firstName lastName email")
    .populate("plan")
    .populate("promo");
  if (!sub) throw ApiError.notFound("Subscription not found");
  if (req.user.role !== "admin" && String(sub.member._id) !== String(req.user._id)) {
    throw ApiError.forbidden();
  }
  sendSuccess(res, { data: sub });
});
