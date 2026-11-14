import { Schema, model, type InferSchemaType } from 'mongoose';
import { mediaReference, modelOptions, seoFields, slugField } from '../../models/schema-fields.js';
const blogPostSchema = new Schema({
  isDemo: { type: Boolean, default: false },
  featured: { type: Boolean, default: false },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  slug: slugField,
  excerpt: { type: String, maxlength: 400, default: '' },
  content: { type: String, default: '', maxlength: 200_000 },
  coverImage: mediaReference,
  gallery: [mediaReference],
  category: { type: String, required: true, maxlength: 100 },
  tags: [{ type: String, maxlength: 50 }],
  author: { type: String, required: true, maxlength: 120 },
  ...seoFields,
  status: { type: String, enum: ['draft', 'scheduled', 'published', 'archived'], default: 'draft' },
  publishedAt: Date,
  scheduledAt: Date,
}, modelOptions);
blogPostSchema.index({ status: 1, publishedAt: -1 });
blogPostSchema.index({ status: 1, scheduledAt: 1 });
blogPostSchema.index({ category: 1, status: 1 });
blogPostSchema.index({ title: 'text', excerpt: 'text', tags: 'text' });
export type BlogPostDocument = InferSchemaType<typeof blogPostSchema>;
export const BlogPost = model('BlogPost', blogPostSchema);
