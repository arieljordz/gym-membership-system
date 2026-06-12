import { Router } from "express";
import { body } from "express-validator";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";
import * as attendance from "../controllers/attendanceController.js";

const router = Router();
router.use(protect);

router.get("/mine", attendance.myAttendance);
router.post(
  "/scan",
  authorize("admin", "staff"),
  [body("qr").notEmpty().withMessage("qr payload is required")],
  validate,
  attendance.scan
);
router.get("/", authorize("admin", "staff"), attendance.listAttendance);
router.get("/export", authorize("admin", "staff"), attendance.exportAttendance);

export default router;
