import { InferSchemaType, Schema, model } from 'mongoose';

const blogSchema = new Schema({
  slug: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  excerpt: { type: String, required: true, trim: true },
  author: { type: String, required: true, trim: true },
  readTime: { type: String, required: true, trim: true },
  image: { type: String, required: true },
  content: [{ type: String }]
}, { timestamps: true });

export type Blog = InferSchemaType<typeof blogSchema>;
export const BlogModel = model('Blog', blogSchema);
