import { randomUUID } from 'node:crypto';
import { configureCloudinary } from './cloudinary.js';
import type { AppEnv } from './env.js';
export interface MediaStorage { upload(buffer: Buffer): Promise<{ publicId: string; url: string }> }
export function createMediaStorage(env: AppEnv): MediaStorage | undefined {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) return undefined;
  const cloudinary = configureCloudinary(env);
  return { upload(buffer) {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({
        public_id: 'artopus-learn/' + randomUUID(), resource_type: 'image', format: 'webp',
        overwrite: false, allowed_formats: ['webp'],
      }, (error, result) => error || !result ? reject(error ?? new Error('Image upload failed')) : resolve({ publicId: result.public_id, url: result.secure_url }));
      stream.end(buffer);
    });
  } };
}
