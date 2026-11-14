import type { ArtEvent, ContentQuery, PaginatedResult } from '@artopus/shared';
import { Event } from './event.model.js';
import { ApiError } from '../../lib/api-error.js';
import { createContentService } from '../../lib/admin-content.js';
import { eventInputSchema } from '@artopus/shared';
import { pagination, searchFilter, serialize } from '../../lib/public-content.js';
export const eventsService = {
  async list(query: ContentQuery): Promise<PaginatedResult<ArtEvent>> {
    const now = new Date();
    const timeline = query.status === 'upcoming' ? { startDate: { $gt: now } } : query.status === 'ongoing' ? { startDate: { $lte: now }, endDate: { $gte: now } } : query.status === 'completed' ? { endDate: { $lt: now } } : {};
    const filter = { status: 'published', ...timeline, ...searchFilter(query), ...(query.type ? { eventType: query.type } : {}) };
    const { skip, limit } = pagination(query);
    const [items, total] = await Promise.all([Event.find(filter).sort({ startDate: query.status === 'completed' ? -1 : 1, _id: 1 }).skip(skip).limit(limit).populate('poster gallery').lean(), Event.countDocuments(filter)]);
    return { items: serialize<ArtEvent[]>(items), page: query.page, limit, total };
  },
  async getBySlug(slug: string): Promise<ArtEvent> {
    const event = await Event.findOne({ slug, status: 'published' }).populate('poster gallery').lean();
    if (!event) throw new ApiError(404, 'NOT_FOUND', 'This event is not available.');
    return serialize<ArtEvent>(event);
  },
  admin: createContentService(Event, eventInputSchema, ["poster","registrationDeadline","eligibility","fee","registrationUrl","rules","results","seoTitle","seoDescription"], ["poster","gallery"]),
};
