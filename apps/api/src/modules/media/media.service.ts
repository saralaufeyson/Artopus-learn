import sharp from 'sharp';
import { objectIdSchema, paginationSchema, mediaUpdateSchema } from '@artopus/shared';
import { ApiError } from '../../lib/api-error.js';
import { serialize, escapeSearch } from '../../lib/public-content.js';
import { MediaAsset } from './media.model.js';
import { BlogPost } from '../blogs/blog.model.js';
import { Event } from '../events/event.model.js';
import { ClassOffering } from '../classes/class.model.js';
import { SiteSettings } from '../settings/settings.model.js';
import type { MediaStorage } from '../../config/media-storage.js';
export const mediaService = {
  async list(query: unknown) {
    const { page, limit } = paginationSchema.parse(query);
    const filter = { removedAt: null };
    const [items, total] = await Promise.all([MediaAsset.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(), MediaAsset.countDocuments(filter)]);
    return { items: serialize(items), total, page, limit };
  },
  async upload(file: Express.Multer.File | undefined, body: unknown, storage?: MediaStorage) {
    if (!storage) throw new ApiError(503, 'MEDIA_NOT_CONFIGURED', 'Image storage has not been configured. Contact the site owner.');
    if (!file) throw new ApiError(400, 'INVALID_IMAGE', 'Choose an image to upload.');
    const { altText } = mediaUpdateSchema.parse(body);
    let buffer: Buffer;
    try {
      const image = sharp(file.buffer, { limitInputPixels: 40_000_000, failOn: 'warning', animated: false });
      const meta = await image.metadata();
      if (!['jpeg', 'png', 'webp'].includes(meta.format ?? '') || (meta.pages ?? 1) > 1 ||
        ({ jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }[meta.format as 'jpeg' | 'png' | 'webp']) !== file.mimetype) throw new Error('Invalid format');
      buffer = await image.rotate().resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true }).webp({ quality: 85 }).toBuffer();
    } catch { throw new ApiError(400, 'INVALID_IMAGE', 'This file could not be decoded as a safe JPEG, PNG, or WebP image.'); }
    try {
      const stored = await storage.upload(buffer);
      return serialize((await MediaAsset.create({ ...stored, mimeType: 'image/webp', fileSize: buffer.length, altText })).toObject());
    } catch { throw new ApiError(503, 'UPLOAD_FAILED', 'The image could not be saved. Try again later.'); }
  },
  async update(id: string, body: unknown) {
    const result = await MediaAsset.findOneAndUpdate({ _id: objectIdSchema.parse(id), removedAt: null }, mediaUpdateSchema.parse(body), { new: true, runValidators: true }).lean();
    if (!result) throw new ApiError(404, 'NOT_FOUND', 'This image is not available.');
    return serialize(result);
  },
  async remove(id: string) {
    objectIdSchema.parse(id);
    const refs = await Promise.all([
      BlogPost.exists({ $or: [{ coverImage: id }, { gallery: id }, { content: new RegExp(id) }] }),
      Event.exists({ $or: [{ poster: id }, { gallery: id }] }),
      ClassOffering.exists({ thumbnail: id }),
      SiteSettings.exists({ $or: ['branding.logo', 'heroSection.image', 'aboutSection.image', 'seoDefaults.shareImage', 'featuredContent.gallery'].map(key => ({ [key]: id })) }),
    ]);
    const asset = await MediaAsset.findOne({ _id: id, removedAt: null });
    if (!asset) throw new ApiError(404, 'NOT_FOUND', 'This image is not available.');
    // Also protect images inserted by URL in rich text.
    const matchUrl = { $regex: escapeSearch(asset.url) };
    const urlRefs = await Promise.all([
      BlogPost.exists({ content: matchUrl }),
      Event.exists({ $or: ['description', 'rules', 'results'].map(key => ({ [key]: matchUrl })) }),
      ClassOffering.exists({ description: matchUrl }),
      SiteSettings.exists({ 'aboutSection.content': matchUrl }),
    ]);
    if ([...refs, ...urlRefs].some(Boolean)) throw new ApiError(409, 'MEDIA_IN_USE', 'This image is used by website content. Remove those references before removing it from the library.');
    // Retain the hosted file so concurrent edits and previously rendered pages cannot break.
    asset.set('removedAt', new Date()); await asset.save();
  },
};
