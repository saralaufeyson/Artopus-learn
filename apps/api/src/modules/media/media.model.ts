import { Schema, model, type InferSchemaType } from 'mongoose';
const mediaAssetSchema = new Schema({
  removedAt: { type: Date, default: null },
  publicId: { type: String, required: true, unique: true },
  url: { type: String, required: true },
  mimeType: { type: String, required: true, enum: ['image/jpeg', 'image/png', 'image/webp'] },
  fileSize: { type: Number, required: true, min: 1, max: 10 * 1024 * 1024 },
  altText: { type: String, required: true, trim: true, maxlength: 300 },
}, { timestamps: { createdAt: true, updatedAt: false }, strict: 'throw' });
mediaAssetSchema.index({ createdAt: -1 });
export type MediaAssetDocument = InferSchemaType<typeof mediaAssetSchema>;
export const MediaAsset = model('MediaAsset', mediaAssetSchema);
