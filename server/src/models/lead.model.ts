import { InferSchemaType, Schema, model } from 'mongoose';

const leadSchema = new Schema({
  customer: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  property: { type: String, default: 'General Enquiry', trim: true },
  city: { type: String, trim: true },
  budget: { type: String, trim: true },
  message: { type: String, trim: true, maxlength: 2000 },
  source: { type: String, default: 'Contact Enquiry', trim: true },
  status: { type: String, enum: ['New', 'Contacted', 'Site Visit', 'Negotiation', 'Booked', 'Closed'], default: 'New', index: true },
}, { timestamps: true });
leadSchema.index({ createdAt: -1, status: 1 });
export type Lead = InferSchemaType<typeof leadSchema>;
export const LeadModel = model('Lead', leadSchema);
