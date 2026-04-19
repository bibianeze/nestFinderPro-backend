import { Router } from "express";
import {
  getProperties,
  getAllPropertiesAdmin,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
} from "../controllers/propertyController";
import { protect, adminOnly } from "../middleware/authMiddleware";

// ============================================================
// PROPERTY ROUTES
// Base: /api/properties
// ============================================================

const router = Router();

// Public routes — no token needed
router.get("/", getProperties);
router.get("/:id", getProperty);

// Admin only routes — token + admin role required
router.get("/admin/all", protect, adminOnly, getAllPropertiesAdmin);
router.post("/", protect, adminOnly, createProperty);
router.put("/:id", protect, adminOnly, updateProperty);
router.delete("/:id", protect, adminOnly, deleteProperty);

export default router;