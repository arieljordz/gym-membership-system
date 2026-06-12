import MembershipPlan from "../models/MembershipPlan.js";
import Promotion from "../models/Promotion.js";
import QRPass from "../models/QRPass.js";
import { randomToken } from "../utils/token.js";
import { signQrPayload, generateQrDataUrl } from "../utils/qrcode.js";

const DAY_MS = 24 * 60 * 60 * 1000;

// Highest-discount promo that is live today and applies to the given plan.
export const findBestPromoForPlan = async (planId) => {
  const now = new Date();
  const promos = await Promotion.find({
    status: "active",
    startDate: { $lte: now },
    endDate: { $gte: now },
    $or: [{ appliesToPlans: { $size: 0 } }, { appliesToPlans: planId }],
  }).sort({ discountPercentage: -1 });
  return promos[0] || null;
};

export const computePricing = (plan, promo) => {
  const basePrice = plan.price;
  const pct = promo ? promo.discountPercentage : 0;
  const discountAmount = Math.round(((basePrice * pct) / 100) * 100) / 100;
  const finalPrice = Math.max(basePrice - discountAmount, 0);
  return { basePrice, discountAmount, finalPrice };
};

// Issues (or refreshes) a signed QR pass for an active subscription.
export const generateQrPassForSubscription = async (subscription, member) => {
  const memberId = String(member?._id || member);
  const code = `GYM-${randomToken(6).toUpperCase()}`;
  const payload = signQrPayload({
    memberId,
    subscriptionId: String(subscription._id),
    code,
    expiryDate: new Date(subscription.endDate).toISOString(),
  });
  const qrImage = await generateQrDataUrl(JSON.stringify(payload));

  return QRPass.findOneAndUpdate(
    { subscription: subscription._id },
    {
      member: memberId,
      subscription: subscription._id,
      code,
      payload,
      qrImage,
      expirationDate: subscription.endDate,
      active: true,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

// Sets the active window based on the plan duration and flips status to active.
export const activateSubscription = async (subscription) => {
  const plan = await MembershipPlan.findById(subscription.plan);
  const start = new Date();
  const end = new Date(start.getTime() + plan.durationDays * DAY_MS);
  subscription.startDate = start;
  subscription.endDate = end;
  subscription.status = "active";
  await subscription.save();
  return subscription;
};
