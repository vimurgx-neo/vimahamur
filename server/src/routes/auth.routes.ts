import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { requireAuth, requireRole, AuthRequest } from '../middlewares/auth.middleware.js';
import { UserModel } from '../models/user.model.js';
import { PropertyModel } from '../models/property.model.js';
import { BlogModel } from '../models/blog.model.js';
import { BookingModel } from '../models/booking.model.js';
import { LeadModel } from '../models/lead.model.js';
import { OAuth2Client } from 'google-auth-library';

export const authRouter = Router();
const client = new OAuth2Client(env.googleClientId);

const credentials = [
  body('email').isEmail().withMessage('Valid email address is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const invalid = (req: any, res: Response): boolean => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return false;
  res.status(422).json({ message: 'Please correct the highlighted fields.', errors: errors.array() });
  return true;
};

const tokenFor = (user: any) => ({
  token: jwt.sign({ id: user._id.toString(), role: user.role }, env.jwtSecret, { expiresIn: '7d' }), // Extend session to 7 days for better UX
  role: user.role,
  userName: user.name,
  email: user.email,
  phone: user.phone ?? '',
  savedProperties: user.savedProperties ?? []
});

authRouter.post('/register', [
  body('name').trim().notEmpty(),
  body('phone').optional().trim(),
  ...credentials
], async (req: any, res: any, next: any) => {
  try {
    if (invalid(req, res)) return;
    const cleanEmail = (req.body.email ?? '').trim().toLowerCase();
    const emailExists = await UserModel.exists({ email: { $regex: new RegExp(`^${cleanEmail}$`, 'i') } });
    if (emailExists) {
      res.status(409).json({ message: 'An account already exists for this email.' });
      return;
    }
    const user = await UserModel.create({
      name: req.body.name,
      email: cleanEmail,
      phone: req.body.phone ?? '',
      passwordHash: await bcrypt.hash(req.body.password, 12),
      role: 'Customer'
    });
    res.status(201).json(tokenFor(user));
  } catch (e) {
    next(e);
  }
});

authRouter.post('/login', credentials, async (req: any, res: any, next: any) => {
  try {
    if (invalid(req, res)) return;
    const cleanEmail = (req.body.email ?? '').trim().toLowerCase();
    const user = await UserModel.findOne({ email: { $regex: new RegExp(`^${cleanEmail}$`, 'i') } }).populate('savedProperties');
    if (!user || !(await bcrypt.compare(req.body.password, user.passwordHash))) {
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }
    console.info(`[AUTH] User ${user.email} (${user.role}) logged in successfully at ${new Date().toISOString()}`);
    res.json(tokenFor(user));
  } catch (e) {
    next(e);
  }
});

authRouter.post('/google', async (req: any, res: any, next: any) => {
  try {
    const { token } = req.body;
    if (!token) {
      res.status(400).json({ message: 'Token is required.' });
      return;
    }

    let payload: any;
    
    // Check if in development/mock mode bypass
    if (env.googleClientId === 'development-google-client-id' && token.startsWith('mock-')) {
      const mockEmail = token.replace('mock-', '');
      const mockName = mockEmail.split('@')[0];
      payload = {
        email: mockEmail,
        name: mockName.charAt(0).toUpperCase() + mockName.slice(1),
        email_verified: true
      };
    } else {
      try {
        const ticket = await client.verifyIdToken({
          idToken: token,
          audience: env.googleClientId,
        });
        payload = ticket.getPayload();
      } catch (err) {
        console.error('Google token verification failed:', err);
        res.status(401).json({ message: 'Google authentication failed. Invalid token.' });
        return;
      }
    }

    if (!payload || !payload.email) {
      res.status(401).json({ message: 'Could not retrieve email from Google token.' });
      return;
    }

    const cleanEmail = payload.email.trim().toLowerCase();
    let user = await UserModel.findOne({ email: { $regex: new RegExp(`^${cleanEmail}$`, 'i') } });
    if (!user) {
      user = await UserModel.create({
        name: payload.name || cleanEmail.split('@')[0],
        email: cleanEmail,
        phone: '',
        passwordHash: await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 12),
        role: 'Customer'
      });
    }

    console.info(`[AUTH] Google User ${user.email} (${user.role}) logged in successfully at ${new Date().toISOString()}`);
    res.json(tokenFor(user));
  } catch (e) {
    next(e);
  }
});

authRouter.get('/me', requireAuth, async (req: AuthRequest, res: any, next: any) => {
  try {
    const user = await UserModel.findById(req.user!.id).populate('savedProperties').lean();
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }
    res.json({
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone ?? '',
        savedProperties: user.savedProperties ?? []
      }
    });
  } catch (e) {
    next(e);
  }
});

authRouter.post('/forgot-password', body('email').isEmail().normalizeEmail(), async (req: any, res: any, next: any) => {
  try {
    if (invalid(req, res)) return;
    const user = await UserModel.findOne({ email: req.body.email });
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      user.resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
      user.resetTokenExpiresAt = new Date(Date.now() + 3_600_000);
      await user.save();
      
      // In production we would send an email. For this app, we will print it to logs and send in response for easy developer verification!
      console.info(`[Auth] Forgot Password requested. Reset token for ${user.email} is: ${token}`);
      res.json({ message: 'If that account exists, a reset email will be sent.', token }); // Send token back for easier demo/testing
      return;
    }
    res.json({ message: 'If that account exists, a reset email will be sent.' });
  } catch (e) {
    next(e);
  }
});

authRouter.post('/reset-password', [
  body('token').trim().notEmpty(),
  body('password').isLength({ min: 8 })
], async (req: any, res: any, next: any) => {
  try {
    if (invalid(req, res)) return;
    const { token, password } = req.body;
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    const user = await UserModel.findOne({
      resetTokenHash: tokenHash,
      resetTokenExpiresAt: { $gt: new Date() }
    });
    
    if (!user) {
      res.status(400).json({ message: 'The reset link is invalid or has expired.' });
      return;
    }
    
    user.passwordHash = await bcrypt.hash(password, 12);
    user.resetTokenHash = undefined;
    user.resetTokenExpiresAt = undefined;
    await user.save();
    
    res.json({ message: 'Your password has been successfully updated.' });
  } catch (e) {
    next(e);
  }
});

authRouter.put('/profile', requireAuth, [
  body('name').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('phone').optional().trim(),
  body('password').optional().custom((val) => !val || val.length >= 8)
], async (req: AuthRequest, res: any, next: any) => {
  try {
    if (invalid(req, res)) return;
    const { name, email, phone, password } = req.body;
    
    const existingUser = await UserModel.findOne({ email, _id: { $ne: req.user!.id } });
    if (existingUser) {
      res.status(409).json({ message: 'An account already exists with that email address.' });
      return;
    }
    
    const user = await UserModel.findById(req.user!.id);
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }
    
    user.name = name;
    user.email = email;
    user.phone = phone;
    if (password) {
      user.passwordHash = await bcrypt.hash(password, 12);
    }
    
    await user.save();
    res.json({
      message: 'Profile updated successfully.',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone ?? '',
        role: user.role
      }
    });
  } catch (e) {
    next(e);
  }
});

authRouter.post('/profile/saved-properties', requireAuth, async (req: AuthRequest, res: any, next: any) => {
  try {
    const { propertyId } = req.body;
    if (!propertyId) {
      res.status(400).json({ message: 'Property ID is required.' });
      return;
    }
    
    const user = await UserModel.findById(req.user!.id);
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }
    
    if (!user.savedProperties.includes(propertyId as any)) {
      user.savedProperties.push(propertyId as any);
      await user.save();
    }
    
    await user.populate('savedProperties');
    res.json({ message: 'Property added to saved list.', data: user.savedProperties });
  } catch (e) {
    next(e);
  }
});

authRouter.delete('/profile/saved-properties/:propertyId', requireAuth, async (req: AuthRequest, res: any, next: any) => {
  try {
    const { propertyId } = req.params;
    const user = await UserModel.findById(req.user!.id);
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }
    
    user.savedProperties = user.savedProperties.filter(id => id.toString() !== propertyId) as any;
    await user.save();
    
    await user.populate('savedProperties');
    res.json({ message: 'Property removed from saved list.', data: user.savedProperties });
  } catch (e) {
    next(e);
  }
});

authRouter.post('/clear-dummy-data', requireAuth, requireRole('SuperAdmin'), async (req: AuthRequest, res: any, next: any) => {
  try {
    await PropertyModel.deleteMany({});
    await BlogModel.deleteMany({});
    await BookingModel.deleteMany({});
    await LeadModel.deleteMany({});
    await UserModel.deleteMany({ role: 'Customer' });
    res.json({ message: 'Dummy data successfully cleared from database!' });
  } catch (e) {
    next(e);
  }
});
