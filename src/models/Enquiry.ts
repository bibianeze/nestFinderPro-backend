import mongoose, { Document, Schema } from "mongoose";

// ============================================================
// ENQUIRY MODEL
// Stores contact form submissions from property detail page
// ============================================================

export interface IEnquiry extends Document {
  name: string;
  email: string;
  message: string;
  propertyId: mongoose.Types.ObjectId;
  propertyName: string;
  status: "new" | "responded";
  createdAt: Date;
}

const EnquirySchema = new Schema<IEnquiry>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    propertyId: { type: Schema.Types.ObjectId, ref: "Property", required: true },
    propertyName: { type: String, required: true },
    status: { type: String, enum: ["new", "responded"], default: "new" },
  },
  { timestamps: true }
);

const Enquiry = mongoose.model<IEnquiry>("Enquiry", EnquirySchema);
export default Enquiry;