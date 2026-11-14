import { Schema, model, type InferSchemaType } from 'mongoose';
import { mediaReference, modelOptions } from '../../models/schema-fields.js';
const cta = new Schema({ label: String, href: String }, { _id: false });
const settingsSchema = new Schema({
  featuredVideo: { type: new Schema({ title: String, description: String, url: String }, { _id: false }), required: false },
  demoMode: { type: Boolean, default: false },
  benefits: [{ title: String, description: String }],
  key: { type: String, enum: ['site'], default: 'site', unique: true, required: true },
  branding: { name: String, tagline: String, ownershipStatement: { type: String, maxlength: 500 }, logo: mediaReference },
  heroSection: { heading: String, description: String, image: mediaReference, primaryCta: cta, secondaryCta: cta },
  aboutSection: { heading: String, content: String, image: mediaReference },
  featuredContent: {
    classes: [{ type: Schema.Types.ObjectId, ref: 'ClassOffering' }],
    events: [{ type: Schema.Types.ObjectId, ref: 'Event' }],
    gallery: [mediaReference],
  },
  finalCta: { heading: String, description: String, action: cta },
  registrationLinks: { classes: String, inquiry: String },
  socialLinks: { instagram: String, drawingClassesInstagram: String, youtube: String, shop: String },
  contactDetails: { email: String, phone: String, address: String },
  seoDefaults: { title: String, description: String, siteUrl: String, shareImage: mediaReference },
}, modelOptions);
export type SiteSettingsDocument = InferSchemaType<typeof settingsSchema>;
export const SiteSettings = model('SiteSettings', settingsSchema);
