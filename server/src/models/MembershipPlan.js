import mongoose from "mongoose";

const membershipPlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    type: {
      type: String,
      enum: ["daily", "weekly", "monthly", "custom"],
      default: "custom",
    },
    durationDays: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    features: [{ type: String, trim: true }],
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, versionKey: false }
);

export const MembershipPlan = mongoose.model("MembershipPlan", membershipPlanSchema);
export default MembershipPlan;
