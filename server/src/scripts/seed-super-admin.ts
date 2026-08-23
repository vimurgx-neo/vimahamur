import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { UserModel } from '../models/user.model.js';

const email = process.env.ADMIN_EMAIL || process.env.SUPER_ADMIN_EMAIL || 'admin@vimahamur.local';
const password = process.env.ADMIN_PASSWORD || process.env.SUPER_ADMIN_PASSWORD || 'ChangeMe!12345';
await mongoose.connect(env.mongoUri);
await UserModel.findOneAndUpdate({ email: email.toLowerCase() }, { name: 'ViMahaMur Luxury Properties Admin', email: email.toLowerCase(), passwordHash: await bcrypt.hash(password, 12), role: 'Admin' }, { upsert: true, new: true, setDefaultsOnInsert: true });
console.info(`Admin is ready: ${email}`);
await mongoose.disconnect();
