import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { BlogModel } from '../models/blog.model.js';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';

export const blogRouter = Router();

const blogValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('excerpt').trim().notEmpty().withMessage('Excerpt is required'),
  body('author').trim().notEmpty().withMessage('Author is required'),
  body('readTime').trim().notEmpty().withMessage('Read time is required'),
  body('image').trim().notEmpty().withMessage('Image URL is required'),
  body('content').isArray({ min: 1 }).withMessage('Content must be a non-empty array of paragraphs')
];

const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ message: 'Validation failed.', errors: errors.array() });
    return;
  }
  next();
};

// GET /api/blogs
blogRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const blogs = await BlogModel.find().sort({ createdAt: -1 }).lean();
    res.json({ data: blogs });
  } catch (error) {
    next(error);
  }
});

// GET /api/blogs/:slug
blogRouter.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const blog = await BlogModel.findOne({ slug: req.params.slug }).lean();
    if (!blog) {
      res.status(404).json({ message: 'Blog article not found' });
      return;
    }
    res.json({ data: blog });
  } catch (error) {
    next(error);
  }
});

// POST /api/blogs (Admin)
blogRouter.post('/', requireAuth, requireRole('Admin'), blogValidation, validate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title } = req.body;
    let slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const slugExists = await BlogModel.exists({ slug });
    if (slugExists) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const blog = await BlogModel.create({
      ...req.body,
      slug
    });

    res.status(201).json({ message: 'Blog post created successfully.', data: blog });
  } catch (error) {
    next(error);
  }
});

// PUT /api/blogs/:id (Admin)
blogRouter.put('/:id', requireAuth, requireRole('Admin'), blogValidation, validate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const blog = await BlogModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!blog) {
      res.status(404).json({ message: 'Blog post not found' });
      return;
    }
    res.json({ message: 'Blog post updated successfully.', data: blog });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/blogs/:id (Admin)
blogRouter.delete('/:id', requireAuth, requireRole('Admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const blog = await BlogModel.findByIdAndDelete(req.params.id);
    if (!blog) {
      res.status(404).json({ message: 'Blog post not found' });
      return;
    }
    res.json({ message: 'Blog post deleted successfully.' });
  } catch (error) {
    next(error);
  }
});
