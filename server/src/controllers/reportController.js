import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import { sendExcel, sendPdf } from "../utils/exporters.js";
import Subscription from "../models/Subscription.js";
import Payment from "../models/Payment.js";
import AttendanceLog from "../models/AttendanceLog.js";

const dateRange = (q, field) => {
  const { dateFrom, dateTo } = q;
  if (!dateFrom && !dateTo) return {};
  const range = {};
  if (dateFrom) range.$gte = new Date(dateFrom);
  if (dateTo) {
    const d = new Date(dateTo);
    d.setHours(23, 59, 59, 999);
    range.$lte = d;
  }
  return { [field]: range };
};

const respond = (res, { format, filename, title, columns, rows, summary }) => {
  if (format === "excel") return sendExcel(res, { filename: `${filename}.xlsx`, sheetName: title, columns, rows });
  if (format === "pdf") return sendPdf(res, { filename: `${filename}.pdf`, title, columns, rows });
  return sendSuccess(res, { data: { count: rows.length, summary, items: rows } });
};

export const membershipReport = asyncHandler(async (req, res) => {
  const filter = { ...dateRange(req.query, "createdAt") };
  if (req.query.status) filter.status = req.query.status;

  const subs = await Subscription.find(filter)
    .populate("member", "firstName lastName email")
    .populate("plan", "name price")
    .sort({ createdAt: -1 });

  const rows = subs.map((s) => ({
    member: s.member ? `${s.member.firstName} ${s.member.lastName}` : "-",
    email: s.member?.email || "-",
    plan: s.plan?.name || "-",
    price: s.finalPrice,
    status: s.status,
    start: s.startDate ? new Date(s.startDate).toLocaleDateString() : "-",
    end: s.endDate ? new Date(s.endDate).toLocaleDateString() : "-",
    created: new Date(s.createdAt).toLocaleDateString(),
  }));
  const columns = [
    { header: "Member", key: "member", width: 22 },
    { header: "Email", key: "email", width: 26 },
    { header: "Plan", key: "plan", width: 16 },
    { header: "Price", key: "price", width: 12 },
    { header: "Status", key: "status", width: 12 },
    { header: "Start", key: "start", width: 14 },
    { header: "End", key: "end", width: 14 },
    { header: "Created", key: "created", width: 14 },
  ];
  respond(res, {
    format: req.query.format,
    filename: "membership-report",
    title: "Membership Report",
    columns,
    rows,
    summary: { total: rows.length },
  });
});

export const revenueReport = asyncHandler(async (req, res) => {
  const match = { status: "approved", ...dateRange(req.query, "reviewedAt") };
  const payments = await Payment.find(match)
    .populate("member", "firstName lastName")
    .populate({ path: "subscription", populate: [{ path: "plan", select: "name" }, { path: "promo", select: "promoName" }] })
    .sort({ reviewedAt: -1 });

  let rows = payments.map((p) => ({
    member: p.member ? `${p.member.firstName} ${p.member.lastName}` : "-",
    plan: p.subscription?.plan?.name || "-",
    promo: p.subscription?.promo?.promoName || "None",
    amount: p.amount,
    method: p.method,
    date: p.reviewedAt ? new Date(p.reviewedAt).toLocaleDateString() : "-",
  }));

  if (req.query.plan) rows = rows.filter((r) => r.plan === req.query.plan);
  if (req.query.promo) rows = rows.filter((r) => r.promo === req.query.promo);

  const total = rows.reduce((sum, r) => sum + (r.amount || 0), 0);
  const columns = [
    { header: "Member", key: "member", width: 24 },
    { header: "Plan", key: "plan", width: 18 },
    { header: "Promo", key: "promo", width: 18 },
    { header: "Amount", key: "amount", width: 14 },
    { header: "Method", key: "method", width: 14 },
    { header: "Date", key: "date", width: 14 },
  ];
  respond(res, {
    format: req.query.format,
    filename: "revenue-report",
    title: "Revenue Report",
    columns,
    rows,
    summary: { totalRevenue: total, transactions: rows.length },
  });
});

export const attendanceReport = asyncHandler(async (req, res) => {
  const filter = { ...dateRange(req.query, "date") };
  if (req.query.member) filter.member = req.query.member;
  if (req.query.result) filter.scanResult = req.query.result;

  const logs = await AttendanceLog.find(filter)
    .populate("member", "firstName lastName email")
    .sort({ date: -1 });

  const rows = logs.map((l) => ({
    member: l.member ? `${l.member.firstName} ${l.member.lastName}` : "-",
    email: l.member?.email || "-",
    date: l.date ? new Date(l.date).toLocaleDateString() : "-",
    timeIn: l.timeIn ? new Date(l.timeIn).toLocaleTimeString() : "-",
    timeOut: l.timeOut ? new Date(l.timeOut).toLocaleTimeString() : "-",
    result: l.scanResult,
  }));
  const columns = [
    { header: "Member", key: "member", width: 22 },
    { header: "Email", key: "email", width: 26 },
    { header: "Date", key: "date", width: 14 },
    { header: "Time In", key: "timeIn", width: 14 },
    { header: "Time Out", key: "timeOut", width: 14 },
    { header: "Result", key: "result", width: 16 },
  ];
  respond(res, {
    format: req.query.format,
    filename: "attendance-report",
    title: "Attendance Report",
    columns,
    rows,
    summary: { total: rows.length },
  });
});
