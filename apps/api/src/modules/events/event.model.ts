import { Schema, model, type InferSchemaType } from 'mongoose';
import { feeSchema, mediaReference, modelOptions, seoFields, slugField } from '../../models/schema-fields.js';
const eventSchema = new Schema({
  isDemo: { type: Boolean, default: false },
  featured: { type: Boolean, default: false },
  title: { type: String, required: true, maxlength: 200 },
  slug: slugField,
  description: { type: String, required: true, maxlength: 100_000 },
  eventType: { type: String, required: true, enum: ['workshop', 'competition', 'exhibition', 'challenge'] },
  poster: mediaReference,
  gallery: [mediaReference],
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  registrationDeadline: Date,
  locationType: { type: String, required: true, enum: ['online', 'offline', 'hybrid'] },
  location: { type: String, maxlength: 500 },
  eligibility: { type: String, maxlength: 2000 },
  fee: feeSchema,
  registrationUrl: String,
  rules: { type: String, maxlength: 20_000 },
  results: { type: String, maxlength: 20_000 },
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  ...seoFields,
}, modelOptions);
eventSchema.index({ status: 1, startDate: 1, endDate: 1 });
eventSchema.index({ eventType: 1, status: 1 });
export type EventDocument = InferSchemaType<typeof eventSchema>;
export const Event = model('Event', eventSchema);
