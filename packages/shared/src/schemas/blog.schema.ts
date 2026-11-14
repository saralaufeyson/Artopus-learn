import { z } from 'zod';
import { objectIdSchema, seoSchema, slugSchema } from './common.schema.js';

export const blogInputSchema = seoSchema.extend({
  isDemo: z.boolean().default(false),
  featured: z.boolean().default(false),
  title: z.string().trim().min(1).max(200),
  slug: slugSchema,
  excerpt: z.string().max(400),
  // Rich-text HTML; the API must sanitize before persisting in Phase 3.
  content: z.string().max(200_000),
  coverImage: objectIdSchema.optional(),
  gallery: z.array(objectIdSchema).max(50).default([]),
  category: z.string().trim().min(1).max(100),
  tags: z.array(z.string().trim().min(1).max(50)).max(20).default([]),
  author: z.string().trim().min(1).max(120),
  status: z.enum(['draft', 'scheduled', 'published', 'archived']).default('draft'),
  publishedAt: z.iso.datetime().optional(),
  scheduledAt: z.iso.datetime().optional(),
}).refine((value) => value.status !== 'scheduled' || Boolean(value.scheduledAt), {
  path: ['scheduledAt'], message: 'Choose a publication time for a scheduled article',
});
export type BlogInput = z.infer<typeof blogInputSchema>;
