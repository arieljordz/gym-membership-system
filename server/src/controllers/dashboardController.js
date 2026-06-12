import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import User from "../models/User.js";
import Subscription from "../models/Subscription.js";
import Payment from "../models/Payment.js";
import AttendanceLog from "../models/AttendanceLog.js";

const sumAmount = async (match) => {
  const r = await Payment.aggregate([{ $match: match }, { $group: { _id: null, t: { $sum: "$amount" } } }]);
  return r[0]?.t || 0;
};

export const adminDashboard = asyncHandler(async (_req, res) => {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - 6);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalMembers, activeMembers, expiredSubs, newThisWeek] = await Promise.all([
    User.countDocuments({ role: "member" }),
    Subscription.countDocuments({ status: "active", endDate: { $gte: now } }),
    Subscription.countDocuments({ status: "expired" }),
    User.countDocuments({ role: "member", createdAt: { $gte: startOfWeek } }),
  ]);

  const [revTotal, revDaily, revWeekly, revMonthly] = await Promise.all([
    sumAmount({ status: "approved" }),
    sumAmount({ status: "approved", reviewedAt: { $gte: startOfToday } }),
    sumAmount({ status: "approved", reviewedAt: { $gte: startOfWeek } }),
    sumAmount({ status: "approved", reviewedAt: { $gte: startOfMonth } }),
  ]);

  const [attToday, attWeek, attMonth] = await Promise.all([
    AttendanceLog.countDocuments({ scanResult: "granted", date: { $gte: startOfToday } }),
    AttendanceLog.countDocuments({ scanResult: "granted", date: { $gte: startOfWeek } }),
    AttendanceLog.countDocuments({ scanResult: "granted", date: { $gte: startOfMonth } }),
  ]);

  const [revenueByDay, attByDay, planDist] = await Promise.all([
    Payment.aggregate([
      { $match: { status: "approved", reviewedAt: { $gte: startOfWeek } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$reviewedAt" } }, total: { $sum: "$amount" } } },
    ]),
    AttendanceLog.aggregate([
      { $match: { scanResult: "granted", date: { $gte: startOfWeek } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, count: { $sum: 1 } } },
    ]),
    Subscription.aggregate([
      { $match: { status: "active" } },
      { $group: { _id: "$plan", count: { $sum: 1 } } },
      { $lookup: { from: "membershipplans", localField: "_id", foreignField: "_id", as: "plan" } },
      { $unwind: "$plan" },
      { $project: { name: "$plan.name", count: 1, _id: 0 } },
    ]),
  ]);

  const key = (d) => d.toISOString().slice(0, 10);
  const last7 = [...Array(7)].map((_, i) => {
    const d = new Date(startOfToday);
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const revMap = Object.fromEntries(revenueByDay.map((r) => [r._id, r.total]));
  const attMap = Object.fromEntries(attByDay.map((r) => [r._id, r.count]));

  sendSuccess(res, {
    data: {
      members: { total: totalMembers, active: activeMembers, expired: expiredSubs, newThisWeek },
      revenue: { total: revTotal, daily: revDaily, weekly: revWeekly, monthly: revMonthly },
      attendance: { today: attToday, week: attWeek, month: attMonth },
      charts: {
        revenueTrend: last7.map((d) => ({ date: key(d), total: revMap[key(d)] || 0 })),
        attendanceTrend: last7.map((d) => ({ date: key(d), count: attMap[key(d)] || 0 })),
        planDistribution: planDist,
      },
    },
  });
});
