import { InferSchemaType, Schema, model } from 'mongoose';

const bookingSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  customerName: { type: String, required: true, trim: true },
  customerPhone: { type: String, required: true, trim: true },
  customerEmail: { type: String, required: true, trim: true, lowercase: true },
  propertyName: { type: String, required: true, trim: true },
  propertySlug: { type: String, required: true, trim: true },
  preferredDate: { type: Date, required: true },
  preferredTime: { type: String, required: true, trim: true },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Cancelled'], default: 'Pending', index: true }
}, { timestamps: true });

export type Booking = InferSchemaType<typeof bookingSchema>;
export const BookingModel = model('Booking', bookingSchema);
