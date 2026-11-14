import type { Model } from 'mongoose';
import { z, type ZodType } from 'zod';
import { paginationSchema, objectIdSchema } from '@artopus/shared';
import { ApiError } from './api-error.js';
import { serialize, escapeSearch } from './public-content.js';
import { sanitizeRichText } from './sanitize-rich-text.js';
import { MediaAsset } from '../modules/media/media.model.js';
const querySchema = paginationSchema.extend({ search: z.string().trim().max(200).optional(), status: z.string().max(30).optional() });
export async function validateMedia(ids: (string | undefined)[]) {
  const unique = [...new Set(ids.filter((id): id is string => Boolean(id)))];
  if (unique.length && await MediaAsset.countDocuments({ _id: { $in: unique }, removedAt: null }) !== unique.length) throw new ApiError(400, 'MEDIA_UNAVAILABLE', 'One of the selected images is no longer available.');
}
export function createContentService<T extends object, Input extends { slug: string; status: string }>(
  model: Model<T>, schema: ZodType<Input>, optionalFields: string[], mediaFields: string[],
) {
  const get = async (id: string) => {
    const record = await model.findById(objectIdSchema.parse(id)).lean();
    if (!record) throw new ApiError(404, 'NOT_FOUND', 'This item is no longer available.');
    return serialize<Record<string, unknown>>(record);
  };
  const save = async (body: unknown, id?: string) => {
    const input = schema.parse(body);
    const values: Record<string, unknown> = { ...input };
    for (const key of ['content', 'description', 'rules', 'results']) if (typeof values[key] === 'string') values[key] = sanitizeRichText(values[key] as string);
    await validateMedia(mediaFields.flatMap(key => Array.isArray(values[key]) ? values[key] as string[] : [values[key] as string | undefined]));
    if (model.modelName === 'BlogPost') {
      if (values.status === 'published' && !values.publishedAt) values.publishedAt = new Date();
      if (values.status === 'scheduled' && Date.parse(String(values.scheduledAt)) <= Date.now()) throw new ApiError(400, 'INVALID_SCHEDULE', 'Choose a publication time in the future.');
      if (values.status !== 'scheduled') delete values.scheduledAt;
    }
    try {
      if (!id) return serialize<Record<string, unknown>>((await model.create(values)).toObject());
      const record = await model.findById(objectIdSchema.parse(id));
      if (!record) throw new ApiError(404, 'NOT_FOUND', 'This item is no longer available.');
      // Full replacement of editable fields clears values removed in the form.
      for (const key of optionalFields) if (!(key in values)) record.set(key, undefined);
      record.set(values);
      await record.save();
      return serialize<Record<string, unknown>>(record.toObject());
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 11000) throw new ApiError(409, 'SLUG_EXISTS', 'This URL slug is already in use. Choose another slug.');
      throw error;
    }
  };
  return {
    get,
    async list(rawQuery: unknown) {
      const query = querySchema.parse(rawQuery);
      const filter = { ...(query.status ? { status: query.status } : {}), ...(query.search ? { title: new RegExp(escapeSearch(query.search), 'i') } : {}) };
      const [items, total] = await Promise.all([model.find(filter).sort({ updatedAt: -1, _id: -1 }).skip((query.page - 1) * query.limit).limit(query.limit).lean(), model.countDocuments(filter)]);
      return { items: serialize<Record<string, unknown>[]>(items), page: query.page, limit: query.limit, total };
    },
    create: (body: unknown) => save(body),
    update: (id: string, body: unknown) => save(body, id),
    async archive(id: string) {
      const record = await model.findById(objectIdSchema.parse(id));
      if (!record) throw new ApiError(404, 'NOT_FOUND', 'This item is no longer available.');
      record.set('status', 'archived'); await record.save();
      return serialize(record.toObject());
    },
  };
}
