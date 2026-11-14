import { z } from 'zod';

export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid record ID');
export const slugSchema = z.string().min(1).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const externalUrlSchema = z.url({ protocol: /^https$/ });
export const publicationStatusSchema = z.enum(['draft', 'published', 'archived']);
export const feeSchema = z.object({ amount: z.number().nonnegative(), currency: z.literal('INR') });
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});
export const seoSchema = z.object({
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(180).optional(),
});
