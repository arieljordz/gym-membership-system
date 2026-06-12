import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { sendSuccess, paginate } from "../utils/ApiResponse.js";
import { parseQrText, verifyQrSignature } from "../utils/qrcode.js";
import { sendExcel, sendPdf } from "../utils/exporters.js";
import QRPass from "../models/QRPass.js";
import Subscription from "../models/Subscription.js";
import AttendanceLog from "../models/AttendanceLog.js";

const buildAttendanceFilter = (q) => {
  const { member, result, dateFrom, dateTo } = q;
  const filter = {};
  if (member) filter.member = member;
  if (result) filter.scanResult = result;
  if (dateFrom || dateTo) {
    filter.date = {};
    if (dateFrom) filter.date.$gte = new Date(dateFrom);
    if (dateTo) {
      const d = new Date(dateTo);
      d.setHours(23, 59, 59, 999);
      filter.date.$lte = d;
    }
  }
  return filter;
};

// POST /attendance/scan  { qr: "<json string from QR>" }  (staff/admin)
export const scan = asyncHandler(async (req, res) => {
  const { qr } = req.body;
  const parsed = typeof qr === "string" ? parseQrText(qr) : qr;

  if (!parsed || !verifyQrSignature(parsed)) {
    await AttendanceLog.create({
      scanResult: "not_found",
      scannedBy: req.user._id,
      notes: "Invalid or tampered QR",
    });
    return sendSuccess(res, {
      message: "Invalid QR Code",
      data: { result: "not_found", access: false },
    });
  }

  const pass = await QRPass.findOne({ code: parsed.code }).populate(
    "member",
    "firstName lastName email"
  );
  if (!pass) {
    await AttendanceLog.create({
      scanResult: "not_found",
      scannedBy: req.user._id,
      notes: "QR pass not found",
    });
    return sendSuccess(res, {
      message: "Invalid QR Code",
      data: { result: "not_found", access: false },
    });
  }

  const sub = await Subscription.findById(pass.subscription);
  const now = new Date();

  if (!sub || sub.status !== "active") {
    await AttendanceLog.create({
      member: pass.member._id,
      subscription: pass.subscription,
      scanResult: "denied_inactive",
      scannedBy: req.user._id,
    });
    return sendSuccess(res, {
      message: "Membership inactive. Access denied.",
      data: { result: "denied_inactive", access: false, member: pass.member },
    });
  }

  if (new Date(sub.endDate) < now) {
    await AttendanceLog.create({
      member: pass.member._id,
      subscription: sub._id,
      scanResult: "denied_expired",
      scannedBy: req.user._id,
    });
    return sendSuccess(res, {
      message: "Membership expired. Access denied.",
      data: { result: "denied_expired", access: false, member: pass.member, expiryDate: sub.endDate },
    });
  }

  // Granted: toggle time-in / time-out for the day.
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const open = await AttendanceLog.findOne({
    member: pass.member._id,
    scanResult: "granted",
    timeIn: { $gte: startOfDay },
    timeOut: null,
  }).sort({ timeIn: -1 });

  let log;
  let action;
  if (open) {
    open.timeOut = now;
    await open.save();
    log = open;
    action = "checkout";
  } else {
    log = await AttendanceLog.create({
      member: pass.member._id,
      subscription: sub._id,
      date: now,
      timeIn: now,
      scanResult: "granted",
      scannedBy: req.user._id,
    });
    action = "checkin";
  }

  sendSuccess(res, {
    message: `Access Granted. Welcome ${pass.member.firstName} ${pass.member.lastName}!`,
    data: {
      result: "granted",
      access: true,
      action,
      member: pass.member,
      expiryDate: sub.endDate,
      log,
    },
  });
});

export const myAttendance = asyncHandler(async (req, res) => {
  const logs = await AttendanceLog.find({ member: req.user._id }).sort({ date: -1 }).limit(100);
  sendSuccess(res, { data: logs });
});

export const listAttendance = asyncHandler(async (req, res) => {
  const filter = buildAttendanceFilter(req.query);
  const { skip, limit, page } = paginate(req.query, req.query);
  const [items, total] = await Promise.all([
    AttendanceLog.find(filter)
      .populate("member", "firstName lastName email")
      .populate("scannedBy", "firstName lastName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    AttendanceLog.countDocuments(filter),
  ]);
  sendSuccess(res, { data: items, meta: { total, page, limit, pages: Math.ceil(total / limit) } });
});

export const exportAttendance = asyncHandler(async (req, res) => {
  const filter = buildAttendanceFilter(req.query);
  const format = req.query.format || "excel";
  const logs = await AttendanceLog.find(filter)
    .populate("member", "firstName lastName email")
    .sort({ createdAt: -1 });

  const rows = logs.map((l) => ({
    member: l.member ? `${l.member.firstName} ${l.member.lastName}` : "-",
    email: l.member?.email || "-",
    date: l.date ? new Date(l.date).toLocaleDateString() : "-",
    timeIn: l.timeIn ? new Date(l.timeIn).toLocaleTimeString() : "-",
    timeOut: l.timeOut ? new Date(l.timeOut).toLocaleTimeString() : "-",
    result: l.scanResult,
  }));
  const columns = [
    { header: "Member", key: "member", width: 24 },
    { header: "Email", key: "email", width: 28 },
    { header: "Date", key: "date", width: 16 },
    { header: "Time In", key: "timeIn", width: 14 },
    { header: "Time Out", key: "timeOut", width: 14 },
    { header: "Result", key: "result", width: 16 },
  ];

  if (format === "pdf") {
    return sendPdf(res, { filename: "attendance.pdf", title: "Attendance Report", columns, rows });
  }
  return sendExcel(res, { filename: "attendance.xlsx", sheetName: "Attendance", columns, rows });
});
