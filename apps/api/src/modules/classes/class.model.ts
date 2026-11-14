import { Schema, model, type InferSchemaType } from 'mongoose';
import { feeSchema, mediaReference, modelOptions, seoFields, slugField } from '../../models/schema-fields.js';
const classOfferingSchema = new Schema({
  isDemo: { type: Boolean, default: false },
  featured: { type: Boolean, default: false },
  title: { type: String, required: true, maxlength: 200 },
  slug: slugField,
  description: { type: String, required: true, maxlength: 50_000 },
  thumbnail: mediaReference,
  ageGroup: { type: String, required: true, maxlength: 100 },
  classMode: { type: String, required: true, enum: ['online', 'offline', 'hybrid'] },
  learningObjectives: [{ type: String, maxlength: 500 }],
  mediums: [{ type: String, maxlength: 100 }],
  schedule: { type: String, maxlength: 2000 },
  duration: { type: String, maxlength: 100 },
  fee: feeSchema,
  instructor: { name: { type: String, maxlength: 120 }, biography: { type: String, maxlength: 3000 } },
  faqs: [{ question: { type: String, maxlength: 500 }, answer: { type: String, maxlength: 3000 } }],
  registrationUrl: String,
  status: { type: String, enum: ['draft', 'active', 'inactive', 'archived'], default: 'draft' },
  displayOrder: { type: Number, min: 0, default: 0 },
  ...seoFields,
}, modelOptions);
classOfferingSchema.index({ status: 1, displayOrder: 1 });
export type ClassOfferingDocument = InferSchemaType<typeof classOfferingSchema>;
export const ClassOffering = model('ClassOffering', classOfferingSchema);
