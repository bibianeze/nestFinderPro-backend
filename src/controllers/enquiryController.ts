import { Request, Response } from "express";
import Enquiry from "../models/Enquiry";
import Property from "../models/Property";
import { sendEmail } from "../config/email";
import { AuthRequest } from "../middleware/authMiddleware";

// ============================================================
// SUBMIT ENQUIRY
// POST /api/enquiries
// Public — any logged in user can submit
// ============================================================
export const submitEnquiry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, message, propertyId } = req.body;

    if (!name || !email || !message || !propertyId) {
      res.status(400).json({ success: false, message: "All fields are required" });
      return;
    }

    // Get property name for the enquiry
    const property = await Property.findById(propertyId);
    if (!property) {
      res.status(404).json({ success: false, message: "Property not found" });
      return;
    }

    // Save enquiry to database
    const enquiry = await Enquiry.create({
      name,
      email,
      message,
      propertyId,
      propertyName: property.propertyName,
    });

    // Send email notification to admin
    await sendEmail({
      to: process.env.ADMIN_EMAIL!,
      subject: `New Enquiry for ${property.propertyName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family:Arial,sans-serif;background:#f3f4f6;padding:40px 0;">
            <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;">
              <div style="background:#1A3C34;padding:24px;text-align:center;">
                <h1 style="color:#fff;margin:0;font-size:20px;">NestFinder Pro</h1>
                <p style="color:#B1FFED;margin:8px 0 0;font-size:13px;">New Property Enquiry</p>
              </div>
              <div style="padding:32px;">
                <h2 style="color:#023337;margin:0 0 16px;">New Enquiry Received</h2>
                <div style="background:#f9fafb;border-radius:8px;padding:16px;margin-bottom:16px;">
                  <p style="margin:0 0 8px;color:#444;"><strong>Property:</strong> ${property.propertyName}</p>
                  <p style="margin:0 0 8px;color:#444;"><strong>From:</strong> ${name}</p>
                  <p style="margin:0 0 8px;color:#444;"><strong>Email:</strong> ${email}</p>
                  <p style="margin:0;color:#444;"><strong>Message:</strong> ${message}</p>
                </div>
                <a href="mailto:${email}" style="display:inline-block;background:#1A3C34;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Reply to ${name}</a>
              </div>
              <div style="background:#f9fafb;padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
                <p style="color:#75928B;font-size:12px;margin:0;">© ${new Date().getFullYear()} NestFinder Pro</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    res.status(201).json({
      success: true,
      message: "Enquiry submitted successfully! The agent will contact you soon.",
      enquiry,
    });
  } catch (error) {
    console.error("Enquiry error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ============================================================
// GET ALL ENQUIRIES
// GET /api/enquiries
// Protected, admin only
// ============================================================
export const getEnquiries = async (req: Request, res: Response): Promise<void> => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: enquiries.length, enquiries });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ============================================================
// UPDATE ENQUIRY STATUS
// PUT /api/enquiries/:id
// Protected, admin only
// ============================================================
export const updateEnquiryStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const enquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!enquiry) {
      res.status(404).json({ success: false, message: "Enquiry not found" });
      return;
    }
    res.status(200).json({ success: true, enquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ============================================================
// DELETE ENQUIRY
// DELETE /api/enquiries/:id
// Protected, admin only
// ============================================================
export const deleteEnquiry = async (req: Request, res: Response): Promise<void> => {
  try {
    await Enquiry.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Enquiry deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};