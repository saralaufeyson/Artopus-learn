import { Schema } from 'mongoose';
export const mediaReference = { type: Schema.Types.ObjectId, ref: 'MediaAsset' };
export const feeSchema = new Schema({ amount: { type: Number, min: 0, required: true }, currency: { type: String, enum: ['INR'], default: 'INR' } }, { _id: false });
export const slugField = { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 160, match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/ };
export const seoFields = { seoTitle: { type: String, maxlength: 70 }, seoDescription: { type: String, maxlength: 180 } };
export const modelOptions = { timestamps: true as const, strict: 'throw' as const };
