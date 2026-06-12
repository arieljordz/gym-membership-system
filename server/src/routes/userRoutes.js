import { Router } from "express";
import { body } from "express-validator";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";
import * as users from "../controllers/userController.js";

const router = Router();
router.use(protect);

router.get("/me", users.getMe);
router.patch("/me", users.updateMe);
router.post(
  "/change-password",
  [body("currentPassword").notEmpty(), body("newPassword").isLength({ min: 8 })],
  validate,
  users.changePassword
);

// Admin user management
router.get("/", authorize("admin"), users.listUsers);
router.get("/:id", authorize("admin"), users.getUser);
router.patch("/:id", authorize("admin"), users.updateUser);
router.delete("/:id", authorize("admin"), users.deleteUser);

export default router;
