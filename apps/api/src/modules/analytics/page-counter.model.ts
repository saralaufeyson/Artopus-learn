import { Schema, model } from 'mongoose';
import { modelOptions } from '../../models/schema-fields.js';
// One aggregate per canonical public path; no visitor identifiers or individual browsing history.
const pageCounterSchema = new Schema({
  _id: { type: String, required: true, maxlength: 169 },
  views: { type: Number, required: true, default: 0, min: 0 },
}, modelOptions);
export const PageCounter = model('PageCounter', pageCounterSchema);
