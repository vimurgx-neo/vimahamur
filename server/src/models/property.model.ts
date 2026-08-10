import { InferSchemaType, Schema, model } from 'mongoose';

const propertySchema = new Schema({
  slug: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, trim: true },
  price: { type: String, required: true, trim: true },
  priceValue: { type: Number, required: true, index: true }, // Store price in Lakhs (e.g. 1.85 Cr -> 185, 92 Lakh -> 92) for easy querying
  location: { type: String, required: true, trim: true },
  area: { type: String, required: true, trim: true },
  type: { type: String, required: true, trim: true },
  image: { type: String, required: true },
  featured: { type: Boolean, default: false, index: true },
  category: { type: String, enum: ['Luxury', 'Luxury Villas', 'Plots', 'Premium Plots', 'Commercial'], required: true, index: true },
  description: { type: String, required: true, trim: true },
  gallery: [{ type: String }],
  floorPlans: [{ type: String }],
  amenities: [{ type: String }],
  nearbyPlaces: [{ type: String }]
}, { timestamps: true });

export type Property = InferSchemaType<typeof propertySchema>;
export const PropertyModel = model('Property', propertySchema);
