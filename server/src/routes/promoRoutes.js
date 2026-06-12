import { Router } from "express";
import { body } from "express-validator";
import { protect } from "../middleware/auth.js";
import { optionalAuth } from "../middleware/optionalAuth.js";
import { authorize } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";
import * as promos from "../controllers/promoController.js";

const router = Router();

const promoValidators = [
  body("promoName").trim().notEmpty().withMessage("Promo name is required"),
  body("discountPercentage").isFloat({ min: 0, max: 100 }).withMessage("Discount must be 0-100"),
  body("startDate").isISO8601().withMessage("Valid start date is required"),
  body("endDate").isISO8601().withMessage("Valid end date is required"),
];

router.get("/", optionalAuth, promos.listPromos);
router.get("/active", promos.activePromos);
router.get("/:id", promos.getPromo);
router.post("/", protect, authorize("admin"), promoValidators, validate, promos.createPromo);
router.patch("/:id", protect, authorize("admin"), promos.updatePromo);
router.patch("/:id/toggle", protect, authorize("admin"), promos.togglePromo);
router.delete("/:id", protect, authorize("admin"), promos.deletePromo);

export default router;
