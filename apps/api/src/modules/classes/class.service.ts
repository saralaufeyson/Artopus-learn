import type { ClassOffering as ClassDto, ContentQuery, PaginatedResult } from '@artopus/shared';
import { ClassOffering } from './class.model.js';
import { ApiError } from '../../lib/api-error.js';
import { createContentService } from '../../lib/admin-content.js';
import { classInputSchema } from '@artopus/shared';
import { pagination, searchFilter, serialize } from '../../lib/public-content.js';
export const classesService = {
  async list(query: ContentQuery): Promise<PaginatedResult<ClassDto>> {
    const filter = { status: 'active', ...searchFilter(query), ...(query.mode ? { classMode: query.mode === 'hybrid' ? 'hybrid' : { $in: [query.mode, 'hybrid'] } } : {}) };
    const { skip, limit } = pagination(query);
    const [items, total] = await Promise.all([ClassOffering.find(filter).sort({ displayOrder: 1, _id: 1 }).skip(skip).limit(limit).populate('thumbnail').lean(), ClassOffering.countDocuments(filter)]);
    return { items: serialize<ClassDto[]>(items), page: query.page, limit, total };
  },
  async getBySlug(slug: string): Promise<ClassDto> {
    const offering = await ClassOffering.findOne({ slug, status: 'active' }).populate('thumbnail').lean();
    if (!offering) throw new ApiError(404, 'NOT_FOUND', 'This class is not available.');
    return serialize<ClassDto>(offering);
  },
  admin: createContentService(ClassOffering, classInputSchema, ["thumbnail","schedule","duration","fee","instructor","registrationUrl","seoTitle","seoDescription"], ["thumbnail"]),
};
