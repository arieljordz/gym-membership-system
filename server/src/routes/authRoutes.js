import { Router } from "express";
import { body } from "express-validator";
import rateLimit from "express-rate-limit";
import { validate } from "../middleware/validate.js";
import * as auth from "../controllers/authController.js";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
});

const strongPassword = body("password")
  .isLength({ min: 8 })
  .withMessage("Password must be at least 8 characters")
  .matches(/[A-Za-z]/)
  .withMessage("Password must contain a letter")
  .matches(/\d/)
  .withMessage("Password must contain a number");

router.post(
  "/register",
  authLimiter,
  [
    body("firstName").trim().notEmpty().withMessage("First name is required"),
    body("lastName").trim().notEmpty().withMessage("Last name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    strongPassword,
  ],
  validate,
  auth.register
);

router.post(
  "/login",
  authLimiter,
  [body("email").isEmail(), body("password").notEmpty()],
  validate,
  auth.login
);

router.post("/refresh", auth.refresh);
router.post("/logout", auth.logout);

router.post(
  "/verify-email",
  [body("email").isEmail(), body("token").notEmpty()],
  validate,
  auth.verifyEmail
);

router.post(
  "/forgot-password",
  authLimiter,
  [body("email").isEmail()],
  validate,
  auth.forgotPassword
);

router.post(
  "/reset-password",
  [body("email").isEmail(), body("token").notEmpty(), strongPassword],
  validate,
  auth.resetPassword
);

export default router;
