import { Router } from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import planRoutes from "./planRoutes.js";
import promoRoutes from "./promoRoutes.js";
import subscriptionRoutes from "./subscriptionRoutes.js";
import paymentRoutes from "./paymentRoutes.js";
import attendanceRoutes from "./attendanceRoutes.js";
import dashboardRoutes from "./dashboardRoutes.js";
import reportRoutes from "./reportRoutes.js";
import notificationRoutes from "./notificationRoutes.js";

const router = Router();

router.get("/health", (_req, res) =>
  res.json({ success: true, message: "API healthy", time: new Date().toISOString() })
);

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/plans", planRoutes);
router.use("/promos", promoRoutes);
router.use("/subscriptions", subscriptionRoutes);
router.use("/payments", paymentRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/reports", reportRoutes);
router.use("/notifications", notificationRoutes);

export default router;
