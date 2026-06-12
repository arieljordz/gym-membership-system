import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: [
        "membership_expiry",
        "payment_approved",
        "payment_rejected",
        "subscription_activated",
        "system",
      ],
      default: "system",
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    channel: { type: String, enum: ["in_app", "email"], default: "in_app" },
    isRead: { type: Boolean, default: false, index: true },
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true, versionKey: false }
);

export const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
