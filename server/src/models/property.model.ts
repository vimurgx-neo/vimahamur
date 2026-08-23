import { InferSchemaType, Schema, model } from 'mongoose';

const propertySchema = new Schema({
  slug: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, trim: true },
  price: { type: String, default: 'Price on Request', trim: true },
  priceValue: { type: Number, default: 0, index: true }, // Store price in Lakhs
  location: { type: String, default: 'Tamil Nadu, India', trim: true },
  area: { type: String, default: 'N/A', trim: true },
  type: { type: String, default: 'Premium Plots', trim: true },
  image: { type: String, default: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80' },
  featured: { type: Boolean, default: false, index: true },
  category: { type: String, enum: ['Luxury', 'Luxury Villas', 'Plots', 'Premium Plots', 'Commercial'], default: 'Plots', index: true },
  description: { type: String, default: '', trim: true },
  gallery: [{ type: String }],
  floorPlans: [{ type: String }],
  amenities: [{ type: String }],
  nearbyPlaces: [{ type: String }]
}, { timestamps: true });

export type Property = InferSchemaType<typeof propertySchema>;
export const PropertyModel = model('Property', propertySchema);
