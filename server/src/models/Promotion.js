import mongoose from "mongoose";

const promotionSchema = new mongoose.Schema(
  {
    promoName: { type: String, required: true, unique: true, trim: true },
    code: { type: String, trim: true, uppercase: true, sparse: true },
    description: { type: String, trim: true },
    discountPercentage: { type: Number, required: true, min: 0, max: 100 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ["active", "inactive"], default: "active", index: true },
    appliesToPlans: [{ type: mongoose.Schema.Types.ObjectId, ref: "MembershipPlan" }],
  },
  { timestamps: true, versionKey: false }
);

// True when the promo is enabled AND today falls within its window.
promotionSchema.virtual("isLive").get(function () {
  const now = new Date();
  return this.status === "active" && this.startDate <= now && this.endDate >= now;
});

promotionSchema.set("toJSON", { virtuals: true });

export const Promotion = mongoose.model("Promotion", promotionSchema);
export default Promotion;
