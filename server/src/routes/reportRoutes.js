import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import * as reports from "../controllers/reportController.js";

const router = Router();
router.use(protect, authorize("admin"));

router.get("/membership", reports.membershipReport);
router.get("/revenue", reports.revenueReport);
router.get("/attendance", reports.attendanceReport);

export default router;
