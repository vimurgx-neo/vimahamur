import { InferSchemaType, Schema, model } from 'mongoose';

const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['Customer', 'Admin', 'SuperAdmin'], default: 'Customer', index: true },
  phone: { type: String, trim: true },
  savedProperties: [{ type: Schema.Types.ObjectId, ref: 'Property' }],
  resetTokenHash: String,
  resetTokenExpiresAt: Date,
}, { timestamps: true });
export type User = InferSchemaType<typeof userSchema>;
export const UserModel = model('User', userSchema);
