import { Router } from "express";
import {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  getUsersCount,
} from "../controllers/authController";
import { protect, adminOnly } from "../middleware/authMiddleware";

// ============================================================
// AUTH ROUTES
// Base: /api/auth
// ============================================================

const router = Router();

// Public routes — no token needed
router.post("/register", register);
router.get("/verify-email/:token", verifyEmail);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/users/count", protect, adminOnly, getUsersCount);

// Protected route — token required
router.get("/me", protect, getMe);

export default router;