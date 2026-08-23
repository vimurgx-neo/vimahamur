import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoose from 'mongoose';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middlewares/error.middleware.js';
import { authRouter } from './routes/auth.routes.js';
import { leadRouter } from './routes/lead.routes.js';
import { propertyRouter } from './routes/property.routes.js';
import { blogRouter } from './routes/blog.routes.js';
import { bookingRouter } from './routes/booking.routes.js';
import bcrypt from 'bcrypt';
import { UserModel } from './models/user.model.js';

const app = express();
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl) or any localhost/127.0.0.1 port
    if (!origin || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: 'draft-8', legacyHeaders: false }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('combined'));

// Ensure uploads folder exists
const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

app.get('/api/health', (_request, response) => response.json({ status: 'ok' }));

app.use('/api/auth', authRouter);
app.use('/api/leads', leadRouter);
app.use('/api/properties', propertyRouter);
app.use('/api/blogs', blogRouter);
app.use('/api/bookings', bookingRouter);

app.use(notFound);
app.use(errorHandler);

async function ensureDefaultUsers(): Promise<void> {
  try {
    // Migrate any legacy SuperAdmin accounts to standard Admin
    await UserModel.updateMany({ role: 'SuperAdmin' }, { role: 'Admin' });

    // Ensure Admin account exists
    const adminEmail = (process.env.ADMIN_EMAIL || process.env.SUPER_ADMIN_EMAIL || 'admin@vimahamur.local').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || process.env.SUPER_ADMIN_PASSWORD || 'ChangeMe!12345';

    const existingAdmin = await UserModel.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash(adminPassword, 12);
      await UserModel.create({
        name: 'ViMahaMur Luxury Properties Admin',
        email: adminEmail,
        phone: '+91 90953 92629',
        passwordHash,
        role: 'Admin'
      });
      console.info(`[AUTH] Auto-created Admin account: ${adminEmail}`);
    }
  } catch (err) {
    console.error('[AUTH] Failed to verify/seed admin user:', err);
  }
}

mongoose.connect(env.mongoUri)
  .then(async () => {
    await ensureDefaultUsers();
    app.listen(env.port, '0.0.0.0', () => console.info(`ViMahaMur Luxury Properties API listening on 0.0.0.0:${env.port}`));
  })
  .catch((error: unknown) => {
    console.error('MongoDB connection failed', error);
    process.exit(1);
  });
