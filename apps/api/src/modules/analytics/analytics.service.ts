import type { PageViewInput, PageViewSummary, PageViewTotal } from '@artopus/shared';
import { PageCounter } from './page-counter.model.js';
import { BlogPost } from '../blogs/blog.model.js';
import { Event } from '../events/event.model.js';
import { ClassOffering } from '../classes/class.model.js';
import { visibleBlogs } from '../../lib/public-content.js';
import { ApiError } from '../../lib/api-error.js';
const landingPages = new Set(['/', '/about', '/contact', '/blog', '/events', '/classes']);
async function isPublicPage(path: string) {
  if (landingPages.has(path)) return true;
  const [, kind, slug] = path.split('/');
  if (kind === 'blog') return Boolean(await BlogPost.exists({ ...visibleBlogs(), slug }));
  if (kind === 'events') return Boolean(await Event.exists({ status: 'published', slug }));
  if (kind === 'classes') return Boolean(await ClassOffering.exists({ status: 'active', slug }));
  return false;
}
export const analyticsService = {
  async total(): Promise<PageViewTotal> {
    const [result] = await PageCounter.aggregate<{ total: number }>([{ $group: { _id: null, total: { $sum: '$views' } } }]);
    return { total: result?.total ?? 0 };
  },
  async record({ path }: PageViewInput): Promise<PageViewTotal> {
    if (!await isPublicPage(path)) throw new ApiError(404, 'PAGE_NOT_FOUND', 'This public page is not available.');
    // The path is Mongo's unique primary key. $inc is atomic, including concurrent first visits.
    await PageCounter.updateOne({ _id: path }, { $inc: { views: 1 } }, { upsert: true });
    return this.total();
  },
  async summary(): Promise<PageViewSummary> {
    const pages = await PageCounter.find().select('views').sort({ views: -1, _id: 1 }).lean();
    return {
      total: pages.reduce((sum, page) => sum + page.views, 0),
      pages: pages.slice(0, 10).map(page => ({ path: page._id, views: page.views })),
    };
  },
};
