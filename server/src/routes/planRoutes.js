import { Router } from "express";
import { body } from "express-validator";
import { protect } from "../middleware/auth.js";
import { optionalAuth } from "../middleware/optionalAuth.js";
import { authorize } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";
import * as plans from "../controllers/planController.js";

const router = Router();

const planValidators = [
  body("name").trim().notEmpty().withMessage("Plan name is required"),
  body("durationDays").isInt({ min: 1 }).withMessage("Duration must be at least 1 day"),
  body("price").isFloat({ min: 0 }).withMessage("Price must be 0 or more"),
];

router.get("/", optionalAuth, plans.listPlans);
router.get("/:id", plans.getPlan);
router.post("/", protect, authorize("admin"), planValidators, validate, plans.createPlan);
router.patch("/:id", protect, authorize("admin"), plans.updatePlan);
router.patch("/:id/toggle", protect, authorize("admin"), plans.togglePlan);
router.delete("/:id", protect, authorize("admin"), plans.deletePlan);

export default router;
