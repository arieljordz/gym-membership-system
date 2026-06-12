import mongoose from "mongoose";

const attendanceLogSchema = new mongoose.Schema(
  {
    member: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    subscription: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription" },
    date: { type: Date, default: Date.now, index: true },
    timeIn: { type: Date },
    timeOut: { type: Date },
    scanResult: {
      type: String,
      enum: ["granted", "denied_expired", "denied_inactive", "not_found"],
      required: true,
    },
    scannedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    notes: { type: String, trim: true },
  },
  { timestamps: true, versionKey: false }
);

export const AttendanceLog = mongoose.model("AttendanceLog", attendanceLogSchema);
export default AttendanceLog;
