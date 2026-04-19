import mongoose, { Document, Schema } from "mongoose";

// ============================================================
// PROPERTY MODEL
// Matches your frontend PropertyType from AddProperty.tsx
// Only admin can create/edit/delete properties
// ============================================================

export interface IProperty extends Document {
  propertyName: string;
  price: number;
  propertyDescription: string;
  propertyType: "Villa" | "Duplex" | "Apartment" | "Residential" | "House";
  sale: "For Sale" | "For Rent";
  location: {
    city: string;
    state: string;
    fullAddress: string;
  };
  propertyDetails: {
    bedrooms: number;
    bathroom: number;
    size: number;
  };
  images: string[];
  amenities: string[];
  isFeatured: boolean;
  isDraft: boolean;
  agentName: string;
  agentPhone: string;
  discount: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema = new Schema<IProperty>(
  {
    propertyName: {
      type: String,
      required: [true, "Property name is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
    },
    propertyDescription: {
      type: String,
      required: [true, "Description is required"],
    },
    propertyType: {
      type: String,
      enum: ["Villa", "Duplex", "Apartment", "Residential", "House"],
      required: [true, "Property type is required"],
    },
    sale: {
      type: String,
      enum: ["For Sale", "For Rent"],
      required: [true, "Listing status is required"],
    },
    location: {
      city: { type: String, required: true },
      state: { type: String, required: true },
      fullAddress: { type: String, required: true },
    },
    propertyDetails: {
      bedrooms: { type: Number, default: 0 },
      bathroom: { type: Number, default: 0 },
      size: { type: Number, default: 0 },
    },
    images: [{ type: String }],
    amenities: [{ type: String }],
    isFeatured: { type: Boolean, default: false },
    isDraft: { type: Boolean, default: false },
    agentName: { type: String, default: "NestFinder Agent" },
    agentPhone: { type: String, default: "+234 800 000 0000" },
    discount: { type: String, default: "" },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Property = mongoose.model<IProperty>("Property", PropertySchema);
export default Property;