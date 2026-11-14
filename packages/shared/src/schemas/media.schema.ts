import { z } from 'zod';
export const mediaUploadSchema = z.object({
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
  fileSize: z.number().int().positive().max(10 * 1024 * 1024),
  altText: z.string().trim().min(1).max(300),
});
export const mediaUpdateSchema = mediaUploadSchema.pick({ altText: true });
export type MediaUploadInput = z.infer<typeof mediaUploadSchema>;
