import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import multer from 'multer';
import path from 'path';
import { PropertyModel } from '../models/property.model.js';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';

export const propertyRouter = Router();

// Validation schema
const propertyValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('price').trim().notEmpty().withMessage('Price is required'),
  body('priceValue').isNumeric().withMessage('Price numeric value is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('area').trim().notEmpty().withMessage('Area is required'),
  body('type').trim().notEmpty().withMessage('Type is required'),
  body('image').trim().notEmpty().withMessage('Primary image is required'),
  body('category').isIn(['Luxury', 'Luxury Villas', 'Plots', 'Premium Plots', 'Commercial']).withMessage('Category must be Luxury, Luxury Villas, Plots, Premium Plots, or Commercial'),
  body('description').trim().notEmpty().withMessage('Description is required')
];

// Helper to check for validation errors
const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ message: 'Validation failed.', errors: errors.array() });
    return;
  }
  next();
};

// GET /api/properties
propertyRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, location, category, budget, sortBy, page, limit } = req.query;

    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: String(search), $options: 'i' } },
        { description: { $regex: String(search), $options: 'i' } }
      ];
    }

    if (location) {
      query.location = { $regex: String(location), $options: 'i' };
    }

    if (category && category !== 'All') {
      query.category = String(category);
    }

    if (budget && budget !== 'All') {
      const budgetStr = String(budget);
      if (budgetStr === 'Under 1 Cr') {
        query.priceValue = { $lt: 100 };
      } else if (budgetStr === '1-2 Cr' || budgetStr === '1–2 Cr' || budgetStr === '1-2Cr') {
        query.priceValue = { $gte: 100, $lte: 200 };
      } else if (budgetStr === 'Above 2 Cr') {
        query.priceValue = { $gt: 200 };
      }
    }

    // Sorting
    let sortOptions: any = { createdAt: -1 };
    if (sortBy === 'price-low') {
      sortOptions = { priceValue: 1 };
    } else if (sortBy === 'price-high') {
      sortOptions = { priceValue: -1 };
    } else if (sortBy === 'featured') {
      sortOptions = { featured: -1, createdAt: -1 };
    }

    // Pagination
    const pageNum = Math.max(1, Number(page ?? 1));
    const limitNum = Math.max(1, Number(limit ?? 10));
    const skipNum = (pageNum - 1) * limitNum;

    const total = await PropertyModel.countDocuments(query);
    const properties = await PropertyModel.find(query)
      .sort(sortOptions)
      .skip(skipNum)
      .limit(limitNum)
      .lean();

    res.json({
      data: properties,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/properties/:slug
propertyRouter.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const property = await PropertyModel.findOne({ slug: req.params.slug }).lean();
    if (!property) {
      res.status(404).json({ message: 'Property not found' });
      return;
    }
    res.json({ data: property });
  } catch (error) {
    next(error);
  }
});

// POST /api/properties (Admin / SuperAdmin)
propertyRouter.post('/', requireAuth, requireRole('Admin', 'SuperAdmin'), propertyValidation, validate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;
    let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    // Ensure slug uniqueness
    const slugExists = await PropertyModel.exists({ slug });
    if (slugExists) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const property = await PropertyModel.create({
      ...req.body,
      slug
    });

    res.status(201).json({ message: 'Property created successfully.', data: property });
  } catch (error) {
    next(error);
  }
});

// PUT /api/properties/:id (Admin / SuperAdmin)
propertyRouter.put('/:id', requireAuth, requireRole('Admin', 'SuperAdmin'), propertyValidation, validate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const property = await PropertyModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!property) {
      res.status(404).json({ message: 'Property not found' });
      return;
    }
    res.json({ message: 'Property updated successfully.', data: property });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/properties/:id (Admin / SuperAdmin)
propertyRouter.delete('/:id', requireAuth, requireRole('Admin', 'SuperAdmin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const property = await PropertyModel.findByIdAndDelete(req.params.id);
    if (!property) {
      res.status(404).json({ message: 'Property not found' });
      return;
    }
    res.json({ message: 'Property deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

// Configure Multer Storage for File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(process.cwd(), 'uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpg, jpeg, png, gif, webp) are allowed'));
  }
});

// POST /api/properties/upload (Admin / SuperAdmin)
propertyRouter.post('/upload', requireAuth, requireRole('Admin', 'SuperAdmin'), upload.single('file'), (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }
    
    const host = req.get('host') ?? 'localhost:3000';
    const protocol = req.protocol;
    const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
    
    res.json({ url: fileUrl });
  } catch (error) {
    next(error);
  }
});
