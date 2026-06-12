import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import * as dashboard from "../controllers/dashboardController.js";

const router = Router();

router.get("/admin", protect, authorize("admin"), dashboard.adminDashboard);

export default router;
