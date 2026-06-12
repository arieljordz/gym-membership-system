import { Router } from "express";
import { protect } from "../middleware/auth.js";
import * as notifications from "../controllers/notificationController.js";

const router = Router();
router.use(protect);

router.get("/", notifications.myNotifications);
router.patch("/read-all", notifications.markAllRead);
router.patch("/:id/read", notifications.markRead);

export default router;
