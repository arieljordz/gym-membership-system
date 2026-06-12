import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    subscription: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription", required: true, index: true },
    member: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    method: {
      type: String,
      enum: ["gcash", "paymaya", "bank_transfer", "cash", "other"],
      default: "gcash",
    },
    referenceNumber: { type: String, trim: true },
    proofImage: { type: String },
    proofPublicId: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    rejectionReason: { type: String, trim: true },
  },
  { timestamps: true, versionKey: false }
);

export const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
