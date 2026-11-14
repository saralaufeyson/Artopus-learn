import { z } from 'zod';
import { paginationSchema } from './common.schema.js';
export const contentQuerySchema = paginationSchema.extend({
  search: z.string().trim().max(100).optional(),
  category: z.string().trim().max(100).optional(),
  featured: z.enum(['true', 'false']).optional(),
  status: z.enum(['upcoming', 'ongoing', 'completed']).optional(),
  type: z.enum(['workshop', 'competition', 'exhibition', 'challenge']).optional(),
  mode: z.enum(['online', 'offline', 'hybrid']).optional(),
});
export type ContentQuery = z.infer<typeof contentQuerySchema>;
