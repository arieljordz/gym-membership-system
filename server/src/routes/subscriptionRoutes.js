import { Router } from "express";
import { body } from "express-validator";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";
import * as subs from "../controllers/subscriptionController.js";

const router = Router();
router.use(protect);

router.post(
  "/",
  [body("planId").notEmpty().withMessage("planId is required")],
  validate,
  subs.createSubscription
);
router.get("/mine", subs.listMySubscriptions);
router.get("/membership", subs.getMyMembership);
router.get("/", authorize("admin"), subs.listSubscriptions);
router.get("/:id", subs.getSubscription);
router.patch("/:id/cancel", subs.cancelSubscription);

export default router;
