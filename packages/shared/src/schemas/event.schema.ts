import { z } from 'zod';
import { externalUrlSchema, feeSchema, objectIdSchema, publicationStatusSchema, seoSchema, slugSchema } from './common.schema.js';

export const eventInputSchema = seoSchema.extend({
  isDemo: z.boolean().default(false),
  featured: z.boolean().default(false),
  title: z.string().trim().min(1).max(200),
  slug: slugSchema,
  description: z.string().min(1).max(100_000),
  eventType: z.enum(['workshop', 'competition', 'exhibition', 'challenge']),
  poster: objectIdSchema.optional(),
  gallery: z.array(objectIdSchema).max(100).default([]),
  startDate: z.iso.datetime(),
  endDate: z.iso.datetime(),
  registrationDeadline: z.iso.datetime().optional(),
  locationType: z.enum(['online', 'offline', 'hybrid']),
  location: z.string().max(500),
  eligibility: z.string().max(2000).optional(),
  fee: feeSchema.optional(),
  registrationUrl: externalUrlSchema.optional(),
  rules: z.string().max(20_000).optional(),
  results: z.string().max(20_000).optional(),
  status: publicationStatusSchema.default('draft'),
}).refine((value) => Date.parse(value.endDate) >= Date.parse(value.startDate), {
  path: ['endDate'], message: 'The event must end on or after its start date',
}).refine((value) => !value.registrationDeadline || Date.parse(value.registrationDeadline) <= Date.parse(value.endDate), {
  path: ['registrationDeadline'], message: 'Registration must close by the end of the event',
});
export type EventInput = z.infer<typeof eventInputSchema>;
