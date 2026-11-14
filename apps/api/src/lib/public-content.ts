import { Types } from 'mongoose';
import type { ContentQuery } from '@artopus/shared';
import { sanitizeRichText } from './sanitize-rich-text.js';
import '../modules/media/media.model.js';

export const visibleBlogs = () => ({ status: 'published', publishedAt: { $lte: new Date() } });
export const escapeSearch = (value: string) => value.replace(/[.*+?^\u0024{}()|[\]\\]/g, '\\$&');
export function serialize<T>(value: unknown): T {
  function visit(input: unknown): unknown {
    if (input instanceof Date) return input.toISOString();
    if (input instanceof Types.ObjectId) return input.toHexString();
    if (Array.isArray(input)) return input.map(visit);
    if (input && typeof input === 'object') {
      return Object.fromEntries(Object.entries(input).filter(([key]) => key !== '__v').map(([key, item]) =>
        [key === '_id' ? 'id' : key, ['content', 'description', 'rules', 'results'].includes(key) && typeof item === 'string' ? sanitizeRichText(item) : visit(item)]));
    }
    return input;
  }
  return visit(value) as T;
}
export function searchFilter(query: ContentQuery) {
  return query.search ? { $or: [{ title: new RegExp(escapeSearch(query.search), 'i') }, { description: new RegExp(escapeSearch(query.search), 'i') }, { excerpt: new RegExp(escapeSearch(query.search), 'i') }] } : {};
}
export function pagination(query: ContentQuery) { return { skip: (query.page - 1) * query.limit, limit: query.limit }; }
