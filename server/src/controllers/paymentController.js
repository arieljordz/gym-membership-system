import fs from "fs";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { sendSuccess, paginate } from "../utils/ApiResponse.js";
import Payment from "../models/Payment.js";
import Subscription from "../models/Subscription.js";
import cloudinary, { cloudinaryEnabled } from "../config/cloudinary.js";
import {
  activateSubscription,
  generateQrPassForSubscription,
} from "../services/membershipService.js";
import { notify } from "../services/notificationService.js";
import { recordAudit } from "../middleware/audit.js";

export const submitPayment = asyncHandler(async (req, res) => {
  const { subscriptionId, amount, method, referenceNumber } = req.body;

  const sub = await Subscription.findOne({ _id: subscriptionId, member: req.user._id });
  if (!sub) throw ApiError.notFound("Subscription not found");
  if (sub.status !== "pending") throw ApiError.badRequest("This subscription is not awaiting payment");
  if (!req.file) throw ApiError.badRequest("Proof of payment image is required");

  let proofImage = `/uploads/${req.file.filename}`;
  let proofPublicId;
  if (cloudinaryEnabled) {
    const up = await cloudinary.uploader.upload(req.file.path, { folder: "gym/payments" });
    proofImage = up.secure_url;
    proofPublicId = up.public_id;
    fs.unlink(req.file.path, () => {});
  }

  const payment = await Payment.create({
    subscription: sub._id,
    member: req.user._id,
    amount: amount ?? sub.finalPrice,
    method,
    referenceNumber,
    proofImage,
    proofPublicId,
    status: "pending",
  });

  sendSuccess(res, {
    statusCode: 201,
    message: "Payment submitted. Awaiting admin approval.",
    data: payment,
  });
});

export const listMyPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ member: req.user._id })
    .populate({ path: "subscription", populate: { path: "plan", select: "name" } })
    .sort({ createdAt: -1 });
  sendSuccess(res, { data: payments });
});

// ===== Admin =====
export const listPayments = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const { skip, limit, page } = paginate(req.query, req.query);
  const [items, total] = await Promise.all([
    Payment.find(filter)
      .populate("member", "firstName lastName email")
      .populate({ path: "subscription", populate: { path: "plan", select: "name price" } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Payment.countDocuments(filter),
  ]);
  sendSuccess(res, { data: items, meta: { total, page, limit, pages: Math.ceil(total / limit) } });
});

export const getPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate("member", "firstName lastName email")
    .populate("subscription");
  if (!payment) throw ApiError.notFound("Payment not found");
  if (req.user.role !== "admin" && String(payment.member._id) !== String(req.user._id)) {
    throw ApiError.forbidden();
  }
  sendSuccess(res, { data: payment });
});

export const approvePayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id).populate("member");
  if (!payment) throw ApiError.notFound("Payment not found");
  if (payment.status === "approved") throw ApiError.badRequest("Payment already approved");

  payment.status = "approved";
  payment.reviewedBy = req.user._id;
  payment.reviewedAt = new Date();
  payment.rejectionReason = undefined;
  await payment.save();

  const sub = await Subscription.findById(payment.subscription);
  await activateSubscription(sub);
  const qrPass = await generateQrPassForSubscription(sub, payment.member);

  await notify({
    user: payment.member,
    type: "payment_approved",
    title: "Payment Approved",
    message: `Your payment of PHP ${payment.amount} has been approved.`,
    email: true,
  });
  await notify({
    user: payment.member,
    type: "subscription_activated",
    title: "Membership Activated",
    message: `Your membership is now active until ${new Date(sub.endDate).toDateString()}.`,
    email: true,
  });
  await recordAudit({ action: "approve_payment", entity: "Payment", entityId: payment._id, req });

  sendSuccess(res, {
    message: "Payment approved and membership activated",
    data: { payment, subscription: sub, qrPass },
  });
});

export const rejectPayment = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const payment = await Payment.findById(req.params.id).populate("member");
  if (!payment) throw ApiError.notFound("Payment not found");

  payment.status = "rejected";
  payment.reviewedBy = req.user._id;
  payment.reviewedAt = new Date();
  payment.rejectionReason = reason;
  await payment.save();

  await notify({
    user: payment.member,
    type: "payment_rejected",
    title: "Payment Rejected",
    message: `Your payment was rejected. ${reason || ""}`.trim(),
    email: true,
  });
  await recordAudit({ action: "reject_payment", entity: "Payment", entityId: payment._id, req });

  sendSuccess(res, { message: "Payment rejected", data: payment });
});
