import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { PropertyModel } from '../models/property.model.js';
import { BlogModel } from '../models/blog.model.js';
import { BookingModel } from '../models/booking.model.js';
import { LeadModel } from '../models/lead.model.js';
import { UserModel } from '../models/user.model.js';

async function clear() {
  console.info('Connecting to MongoDB...');
  await mongoose.connect(env.mongoUri);

  console.info('Clearing database collections...');
  await PropertyModel.deleteMany({});
  await BlogModel.deleteMany({});
  await BookingModel.deleteMany({});
  await LeadModel.deleteMany({});
  await UserModel.deleteMany({ role: 'Customer' });

  console.info('Dummy data successfully removed from database!');
  await mongoose.disconnect();
}

clear().catch((error) => {
  console.error('Database clearing failed', error);
  process.exit(1);
});
