import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { BookingModel } from '../models/booking.model.js';
import { requireAuth, requireRole, AuthRequest } from '../middlewares/auth.middleware.js';

export const bookingRouter = Router();

const bookingValidation = [
  body('customerName').trim().notEmpty().withMessage('Name is required'),
  body('customerPhone').trim().notEmpty().withMessage('Phone is required'),
  body('customerEmail').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('propertyName').trim().notEmpty().withMessage('Property name is required'),
  body('propertySlug').trim().notEmpty().withMessage('Property slug is required'),
  body('preferredDate').isISO8601().withMessage('Preferred date is required and must be a valid date'),
  body('preferredTime').trim().notEmpty().withMessage('Preferred time is required')
];

const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ message: 'Validation failed.', errors: errors.array() });
    return;
  }
  next();
};

// POST /api/bookings (Public - links user if authenticated)
bookingRouter.post('/', bookingValidation, validate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    let userId: string | undefined;
    const authHeader = req.header('authorization');
    if (authHeader) {
      const token = authHeader.replace(/^Bearer\s+/i, '');
      try {
        const decoded = jwt.verify(token, env.jwtSecret) as { id: string };
        userId = decoded.id;
      } catch (e) {
        // Ignore invalid token, record as anonymous
      }
    }

    const booking = await BookingModel.create({
      ...req.body,
      userId
    });

    res.status(201).json({ message: 'Site visit booked successfully.', data: booking });
  } catch (error) {
    next(error);
  }
});

// GET /api/bookings/my-bookings (Customer Only)
bookingRouter.get('/my-bookings', requireAuth, requireRole('Customer'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const bookings = await BookingModel.find({ userId: req.user!.id }).sort({ preferredDate: -1 }).lean();
    res.json({ data: bookings });
  } catch (error) {
    next(error);
  }
});

// GET /api/bookings (Admin)
bookingRouter.get('/', requireAuth, requireRole('Admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookings = await BookingModel.find().sort({ preferredDate: -1 }).lean();
    res.json({ data: bookings });
  } catch (error) {
    next(error);
  }
});

// PUT /api/bookings/:id (Admin)
bookingRouter.put('/:id', requireAuth, requireRole('Admin'), [
  body('status').isIn(['Pending', 'Confirmed', 'Cancelled']).withMessage('Status must be Pending, Confirmed, or Cancelled')
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(422).json({ message: 'Validation failed.', errors: errors.array() });
      return;
    }

    const booking = await BookingModel.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    res.json({ message: 'Booking status updated successfully.', data: booking });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/bookings/:id (Admin)
bookingRouter.delete('/:id', requireAuth, requireRole('Admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await BookingModel.findByIdAndDelete(req.params.id);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }
    res.json({ message: 'Booking request deleted successfully.' });
  } catch (error) {
    next(error);
  }
});
