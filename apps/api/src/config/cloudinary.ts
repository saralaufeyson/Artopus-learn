import { v2 as cloudinary } from 'cloudinary';
import type { AppEnv } from './env.js';
export function configureCloudinary(env: AppEnv) {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    throw new Error('Configure Cloudinary before enabling image uploads');
  }
  cloudinary.config({ cloud_name: env.CLOUDINARY_CLOUD_NAME, api_key: env.CLOUDINARY_API_KEY, api_secret: env.CLOUDINARY_API_SECRET, secure: true });
  return cloudinary;
}
