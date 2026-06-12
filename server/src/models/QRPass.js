import mongoose from "mongoose";

const qrPassSchema = new mongoose.Schema(
  {
    member: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    subscription: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription", required: true, unique: true },
    code: { type: String, required: true, unique: true, index: true },
    payload: { type: mongoose.Schema.Types.Mixed, required: true },
    qrImage: { type: String, required: true }, // PNG data URL
    expirationDate: { type: Date, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

export const QRPass = mongoose.model("QRPass", qrPassSchema);
export default QRPass;
