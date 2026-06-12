import { Router } from "express";
import { body } from "express-validator";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";
import { uploadProof } from "../middleware/upload.js";
import * as payments from "../controllers/paymentController.js";

const router = Router();
router.use(protect);

router.post(
  "/",
  uploadProof.single("proof"),
  [
    body("subscriptionId").notEmpty().withMessage("subscriptionId is required"),
    body("method").optional().isIn(["gcash", "paymaya", "bank_transfer", "cash", "other"]),
  ],
  validate,
  payments.submitPayment
);
router.get("/mine", payments.listMyPayments);
router.get("/", authorize("admin"), payments.listPayments);
router.get("/:id", payments.getPayment);
router.patch("/:id/approve", authorize("admin"), payments.approvePayment);
router.patch("/:id/reject", authorize("admin"), payments.rejectPayment);

export default router;
