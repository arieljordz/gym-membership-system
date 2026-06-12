import mongoose from "mongoose";
import env from "../config/env.js";
import { connectDB } from "../config/db.js";
import logger from "../utils/logger.js";
import User from "../models/User.js";
import MembershipPlan from "../models/MembershipPlan.js";
import Promotion from "../models/Promotion.js";
import Subscription from "../models/Subscription.js";
import Payment from "../models/Payment.js";
import AttendanceLog from "../models/AttendanceLog.js";
import QRPass from "../models/QRPass.js";
import {
  computePricing,
  activateSubscription,
  generateQrPassForSubscription,
} from "../services/membershipService.js";

const run = async () => {
  await connectDB();
  logger.info("Clearing existing data...");
  await Promise.all([
    User.deleteMany({}),
    MembershipPlan.deleteMany({}),
    Promotion.deleteMany({}),
    Subscription.deleteMany({}),
    Payment.deleteMany({}),
    AttendanceLog.deleteMany({}),
    QRPass.deleteMany({}),
  ]);

  logger.info("Creating users...");
  const admin = await User.create({
    firstName: "System",
    lastName: "Admin",
    email: env.admin.email,
    password: env.admin.password,
    role: "admin",
    gender: "other",
    isEmailVerified: true,
  });
  const staff = await User.create({
    firstName: "Front",
    lastName: "Desk",
    email: "apsueno@gmail.com",
    password: "Staff@12345",
    role: "staff",
    gender: "other",
    isEmailVerified: true,
  });
  const members = await User.create([
    { firstName: "John", lastName: "Doe", email: "suenoariel@gmail.com", password: "Member@123", role: "member", gender: "male", contactNumber: "09170000001", address: "Quezon City", isEmailVerified: true },
    { firstName: "Jane", lastName: "Smith", email: "jane@example.com", password: "Member@123", role: "member", gender: "female", contactNumber: "09170000002", address: "Makati City", isEmailVerified: true },
    { firstName: "Mark", lastName: "Reyes", email: "mark@example.com", password: "Member@123", role: "member", gender: "male", isEmailVerified: true },
  ]);

  logger.info("Creating plans...");
  const plans = await MembershipPlan.create([
    { name: "Daily Pass", type: "daily", durationDays: 1, price: 100, description: "Full-day gym access.", features: ["All equipment", "1-day access"] },
    { name: "Weekly Pass", type: "weekly", durationDays: 7, price: 500, description: "7 days of unlimited access.", features: ["All equipment", "Group classes"] },
    { name: "Monthly Pass", type: "monthly", durationDays: 30, price: 1500, description: "Best value for regulars.", features: ["All equipment", "Group classes", "Free locker"] },
  ]);

  logger.info("Creating promotions...");
  const y = new Date().getFullYear();
  const promos = await Promotion.create([
    { promoName: "New Member Promo", code: "NEW20", description: "20% off your first subscription.", discountPercentage: 20, startDate: new Date(y, 0, 1), endDate: new Date(y, 11, 31), status: "active" },
    { promoName: "Student Discount", code: "STUDENT10", description: "10% off for students.", discountPercentage: 10, startDate: new Date(y, 0, 1), endDate: new Date(y, 11, 31), status: "active" },
  ]);

  logger.info("Creating an active membership for John...");
  const john = members[0];
  const plan = plans[2];
  const promo = promos[0];
  const pricing = computePricing(plan, promo);
  const sub = await Subscription.create({
    member: john._id,
    plan: plan._id,
    promo: promo._id,
    ...pricing,
    status: "pending",
  });
  await Payment.create({
    subscription: sub._id,
    member: john._id,
    amount: pricing.finalPrice,
    method: "gcash",
    referenceNumber: "SEED-REF-001",
    proofImage: "/uploads/.gitkeep",
    status: "approved",
    reviewedBy: admin._id,
    reviewedAt: new Date(),
  });
  await activateSubscription(sub);
  await generateQrPassForSubscription(sub, john);

  logger.info("Adding attendance history...");
  const now = new Date();
  for (let i = 0; i < 3; i += 1) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    await AttendanceLog.create({
      member: john._id,
      subscription: sub._id,
      date: d,
      timeIn: d,
      timeOut: new Date(d.getTime() + 90 * 60 * 1000),
      scanResult: "granted",
      scannedBy: staff._id,
    });
  }

  logger.info("===========================================");
  logger.info("Seed complete! Demo credentials:");
  logger.info(`  Admin  : ${env.admin.email} / ${env.admin.password}`);
  logger.info("  Staff  : apsueno@gmail.com / Staff@12345");
  logger.info("  Member : suenoariel@gmail.com / Member@123");
  logger.info("===========================================");

  await mongoose.connection.close();
  process.exit(0);
};

run().catch(async (e) => {
  logger.error("Seed failed:", e);
  await mongoose.connection.close().catch(() => {});
  process.exit(1);
});
