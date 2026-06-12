import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    member: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: "MembershipPlan", required: true },
    promo: { type: mongoose.Schema.Types.ObjectId, ref: "Promotion", default: null },
    basePrice: { type: Number, required: true, min: 0 },
    discountAmount: { type: Number, default: 0, min: 0 },
    finalPrice: { type: Number, required: true, min: 0 },
    startDate: { type: Date },
    endDate: { type: Date },
    status: {
      type: String,
      enum: ["pending", "active", "expired", "cancelled"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true, versionKey: false }
);

subscriptionSchema.virtual("isCurrent").get(function () {
  return this.status === "active" && this.endDate && this.endDate >= new Date();
});

subscriptionSchema.set("toJSON", { virtuals: true });

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
export default Subscription;
