import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { UserModel } from '../models/user.model.js';

const email = process.env.SUPER_ADMIN_EMAIL;
const password = process.env.SUPER_ADMIN_PASSWORD;
if (!email || !password || password === 'ChangeMe!12345') throw new Error('Set a unique SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD in server/.env before seeding.');
await mongoose.connect(env.mongoUri);
await UserModel.findOneAndUpdate({ email: email.toLowerCase() }, { name: 'ViMahaMur Luxury Properties Super Admin', email: email.toLowerCase(), passwordHash: await bcrypt.hash(password, 12), role: 'SuperAdmin' }, { upsert: true, new: true, setDefaultsOnInsert: true });
console.info(`Super Admin is ready: ${email}`);
await mongoose.disconnect();
