import { NextFunction, Request, Response, Router } from 'express';
import { body, validationResult } from 'express-validator';
import { LeadModel } from '../models/lead.model.js';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';

export const leadRouter = Router();

// POST /api/leads (Public - anyone can submit a lead form)
leadRouter.post('/', [
  body('customer').trim().notEmpty().withMessage('Name is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('property').optional().trim(),
  body('source').optional().trim(),
  body('email').optional().trim(),
  body('city').optional().trim(),
  body('budget').optional().trim(),
  body('message').optional().trim()
], async (request: Request, response: Response, next: NextFunction) => {
  try {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      response.status(422).json({ message: 'Please correct the highlighted fields.', errors: errors.array() });
      return;
    }
    const data = {
      ...request.body,
      property: request.body.property && request.body.property.trim() ? request.body.property : 'General Enquiry',
      source: request.body.source && request.body.source.trim() ? request.body.source : 'Contact Enquiry'
    };
    const lead = await LeadModel.create(data);
    response.status(201).json({ data: lead });
  } catch (error) {
    next(error);
  }
});

// GET /api/leads (Admin / SuperAdmin Only)
leadRouter.get('/', requireAuth, requireRole('Admin', 'SuperAdmin'), async (_request: Request, response: Response, next: NextFunction) => {
  try {
    const leads = await LeadModel.find().sort({ createdAt: -1 }).limit(100).lean();
    response.json({ data: leads });
  } catch (error) {
    next(error);
  }
});

// PUT /api/leads/:id (Admin / SuperAdmin Only)
leadRouter.put('/:id', requireAuth, requireRole('Admin', 'SuperAdmin'), [
  body('status').isIn(['New', 'Contacted', 'Site Visit', 'Negotiation', 'Booked', 'Closed']).withMessage('Invalid status')
], async (request: Request, response: Response, next: NextFunction) => {
  try {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      response.status(422).json({ message: 'Validation failed.', errors: errors.array() });
      return;
    }

    const lead = await LeadModel.findByIdAndUpdate(request.params.id, { status: request.body.status }, { new: true });
    if (!lead) {
      response.status(404).json({ message: 'Lead not found' });
      return;
    }

    response.json({ message: 'Lead updated successfully.', data: lead });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/leads/:id (Admin / SuperAdmin Only)
leadRouter.delete('/:id', requireAuth, requireRole('Admin', 'SuperAdmin'), async (request: Request, response: Response, next: NextFunction) => {
  try {
    const lead = await LeadModel.findByIdAndDelete(request.params.id);
    if (!lead) {
      response.status(404).json({ message: 'Lead not found' });
      return;
    }
    response.json({ message: 'Lead deleted successfully.' });
  } catch (error) {
    next(error);
  }
});
