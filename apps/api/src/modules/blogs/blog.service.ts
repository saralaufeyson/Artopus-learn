import type { BlogDetail, BlogPost as BlogDto, ContentQuery, PaginatedResult } from '@artopus/shared';
import { BlogPost } from './blog.model.js';
import { ApiError } from '../../lib/api-error.js';
import { createContentService } from '../../lib/admin-content.js';
import { blogInputSchema } from '@artopus/shared';
import { pagination, searchFilter, serialize, visibleBlogs } from '../../lib/public-content.js';
const images = [{ path: 'coverImage' }, { path: 'gallery' }];
export const blogsService = {
  async list(query: ContentQuery): Promise<PaginatedResult<BlogDto>> {
    const filter = { ...visibleBlogs(), ...searchFilter(query), ...(query.category ? { category: query.category } : {}), ...(query.featured ? { featured: query.featured === 'true' } : {}) };
    const { skip, limit } = pagination(query);
    const [items, total] = await Promise.all([BlogPost.find(filter).sort({ publishedAt: -1, _id: -1 }).skip(skip).limit(limit).populate(images).lean(), BlogPost.countDocuments(filter)]);
    return { items: serialize<BlogDto[]>(items), page: query.page, limit, total };
  },
  async categories(): Promise<string[]> { return (await BlogPost.distinct('category', visibleBlogs())).sort(); },
  async getBySlug(slug: string): Promise<BlogDetail> {
    const post = await BlogPost.findOne({ ...visibleBlogs(), slug }).populate(images).lean();
    if (!post) throw new ApiError(404, 'NOT_FOUND', 'This article is not available.');
    const related = await BlogPost.find({ ...visibleBlogs(), _id: { $ne: post._id }, category: post.category }).sort({ publishedAt: -1 }).limit(3).populate(images).lean();
    return { ...serialize<BlogDto>(post), related: serialize<BlogDto[]>(related) };
  },
  admin: createContentService(BlogPost, blogInputSchema, ["coverImage","seoTitle","seoDescription","publishedAt","scheduledAt"], ["coverImage","gallery"]),
};
