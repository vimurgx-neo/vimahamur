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

mongoose.connect(env.mongoUri)
  .then(() => app.listen(env.port, '0.0.0.0', () => console.info(`ViMahaMur Luxury Properties API listening on 0.0.0.0:${env.port}`)))
  .catch((error: unknown) => {
    console.error('MongoDB connection failed', error);
    process.exit(1);
  });
