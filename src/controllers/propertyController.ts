import { Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import Property from "../models/Property";
import cloudinary from "../config/cloudinary";
import { AuthRequest } from "../middleware/authMiddleware";

// ============================================================
// GET ALL PROPERTIES
// GET /api/properties
// Public — returns all published properties
// ============================================================
export const getProperties = async (req: Request, res: Response): Promise<void> => {
  try {
    const properties = await Property.find({ isDraft: false }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: properties.length,
      properties,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ============================================================
// GET ALL PROPERTIES INCLUDING DRAFTS
// GET /api/properties/admin/all
// Protected, admin only
// ============================================================
export const getAllPropertiesAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const properties = await Property.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: properties.length,
      properties,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ============================================================
// GET SINGLE PROPERTY
// GET /api/properties/:id
// Public
// ============================================================
export const getProperty = async (req: Request, res: Response): Promise<void> => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      res.status(404).json({ success: false, message: "Property not found" });
      return;
    }

    res.status(200).json({ success: true, property });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ============================================================
// CREATE PROPERTY
// POST /api/properties
// Protected, admin only
// ============================================================
export const createProperty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      propertyName,
      price,
      propertyDescription,
      propertyType,
      sale,
      city,
      state,
      fullAddress,
      bedrooms,
      bathroom,
      size,
      amenities,
      isFeatured,
      isDraft,
      agentName,
      agentPhone,
      discount,
    } = req.body;

    // Upload images to Cloudinary
    const imageUrls: string[] = [];

    if (req.files && req.files.images) {
      const files = Array.isArray(req.files.images)
        ? req.files.images
        : [req.files.images];

      for (const file of files as UploadedFile[]) {
        const result = await new Promise<{ secure_url: string }>(
          (resolve, reject) => {
            cloudinary.uploader
              .upload_stream(
                {
                  folder: "nestfinder/properties",
                  transformation: [{ width: 1200, quality: "auto" }],
                },
                (error, result) => {
                  if (error || !result) reject(error);
                  else resolve(result);
                }
              )
              .end(file.data);
          }
        );
        imageUrls.push(result.secure_url);
      }
    }

    // Parse amenities sent as JSON string from frontend
    let parsedAmenities: string[] = [];
    if (amenities) {
      try {
        parsedAmenities =
          typeof amenities === "string" ? JSON.parse(amenities) : amenities;
      } catch {
        parsedAmenities = [];
      }
    }

    const property = await Property.create({
      propertyName,
      price: Number(price),
      propertyDescription,
      propertyType,
      sale,
      location: { city, state, fullAddress },
      propertyDetails: {
        bedrooms: Number(bedrooms) || 0,
        bathroom: Number(bathroom) || 0,
        size: Number(size) || 0,
      },
      images: imageUrls,
      amenities: parsedAmenities,
      isFeatured: isFeatured === "true" || isFeatured === true,
      // ---- FIXED: isDraft was always true because "false" string is truthy ----
      // ---- Now only true when explicitly "true" string ----
      isDraft: isDraft === "true",
      agentName: agentName || "NestFinder Agent",
      agentPhone: agentPhone || "+234 800 000 0000",
      discount: discount || "",
      createdBy: req.user?.id,
    });

    res.status(201).json({
      success: true,
      // ---- FIXED: message now correctly reflects isDraft status ----
      message: isDraft === "true" ? "Property saved to drafts" : "Property published successfully",
      property,
    });
  } catch (error) {
    console.error("Create property error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ============================================================
// UPDATE PROPERTY
// PUT /api/properties/:id
// Protected, admin only
// ============================================================
export const updateProperty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      res.status(404).json({ success: false, message: "Property not found" });
      return;
    }

    const {
      propertyName, price, propertyDescription, propertyType, sale,
      city, state, fullAddress, bedrooms, bathroom, size,
      amenities, isFeatured, isDraft, agentName, agentPhone, discount,
    } = req.body;

    // Handle new image uploads if provided
    let imageUrls: string[] = property.images;

    if (req.files && req.files.images) {
      imageUrls = [];
      const files = Array.isArray(req.files.images)
        ? req.files.images
        : [req.files.images];

      for (const file of files as UploadedFile[]) {
        const result = await new Promise<{ secure_url: string }>(
          (resolve, reject) => {
            cloudinary.uploader
              .upload_stream(
                { folder: "nestfinder/properties" },
                (error, result) => {
                  if (error || !result) reject(error);
                  else resolve(result);
                }
              )
              .end(file.data);
          }
        );
        imageUrls.push(result.secure_url);
      }
    }

    let parsedAmenities = property.amenities;
    if (amenities) {
      try {
        parsedAmenities =
          typeof amenities === "string" ? JSON.parse(amenities) : amenities;
      } catch {
        parsedAmenities = property.amenities;
      }
    }

    property = await Property.findByIdAndUpdate(
      req.params.id,
      {
        propertyName,
        price: price ? Number(price) : property.price,
        propertyDescription,
        propertyType,
        sale,
        location: { city, state, fullAddress },
        propertyDetails: {
          bedrooms: bedrooms ? Number(bedrooms) : property.propertyDetails.bedrooms,
          bathroom: bathroom ? Number(bathroom) : property.propertyDetails.bathroom,
          size: size ? Number(size) : property.propertyDetails.size,
        },
        images: imageUrls,
        amenities: parsedAmenities,
        isFeatured: isFeatured !== undefined
          ? isFeatured === "true" || isFeatured === true
          : property.isFeatured,
        // ---- FIXED: isDraft update also fixed ----
        isDraft: isDraft !== undefined
          ? isDraft === "true"
          : property.isDraft,
        agentName,
        agentPhone,
        discount,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Property updated successfully",
      property,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ============================================================
// DELETE PROPERTY
// DELETE /api/properties/:id
// Protected, admin only
// ============================================================
export const deleteProperty = async (req: Request, res: Response): Promise<void> => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      res.status(404).json({ success: false, message: "Property not found" });
      return;
    }

    await Property.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Property deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};