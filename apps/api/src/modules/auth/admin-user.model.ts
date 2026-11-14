import { Schema, model, type InferSchemaType } from 'mongoose';
import { modelOptions } from '../../models/schema-fields.js';
const adminUserSchema = new Schema({
  name: { type: String, required: true, maxlength: 120 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  passwordHash: { type: String, select: false },
  role: { type: String, enum: ['admin', 'editor'], default: 'editor' },
  status: { type: String, enum: ['active', 'disabled'], default: 'active' },
}, modelOptions);
export type AdminUserDocument = InferSchemaType<typeof adminUserSchema>;
export const AdminUser = model('AdminUser', adminUserSchema);
