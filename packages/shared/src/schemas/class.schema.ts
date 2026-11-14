import { z } from 'zod';
import { externalUrlSchema, feeSchema, objectIdSchema, seoSchema, slugSchema } from './common.schema.js';

export const classInputSchema = seoSchema.extend({
  isDemo: z.boolean().default(false),
  featured: z.boolean().default(false),
  title: z.string().trim().min(1).max(200),
  slug: slugSchema,
  description: z.string().min(1).max(50_000),
  thumbnail: objectIdSchema.optional(),
  ageGroup: z.string().min(1).max(100),
  classMode: z.enum(['online', 'offline', 'hybrid']),
  learningObjectives: z.array(z.string().min(1).max(500)).max(30).default([]),
  mediums: z.array(z.string().max(100)).max(20).default([]),
  schedule: z.string().max(2000).optional(),
  duration: z.string().max(100).optional(),
  fee: feeSchema.optional(),
  instructor: z.object({ name: z.string().max(120), biography: z.string().max(3000).optional() }).optional(),
  faqs: z.array(z.object({ question: z.string().min(1).max(500), answer: z.string().min(1).max(3000) })).max(30).default([]),
  registrationUrl: externalUrlSchema.optional(),
  status: z.enum(['draft', 'active', 'inactive', 'archived']).default('draft'),
  displayOrder: z.number().int().nonnegative().default(0),
});
export type ClassInput = z.infer<typeof classInputSchema>;
