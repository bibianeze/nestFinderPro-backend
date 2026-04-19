import { Router } from "express";
import {
  submitEnquiry,
  getEnquiries,
  updateEnquiryStatus,
  deleteEnquiry,
} from "../controllers/enquiryController";
import { protect, adminOnly } from "../middleware/authMiddleware";

// ============================================================
// ENQUIRY ROUTES
// Base: /api/enquiries
// ============================================================

const router = Router();

// Public — any user can submit an enquiry
router.post("/", submitEnquiry);

// Protected, admin only
router.get("/", protect, adminOnly, getEnquiries);
router.put("/:id", protect, adminOnly, updateEnquiryStatus);
router.delete("/:id", protect, adminOnly, deleteEnquiry);

export default router;