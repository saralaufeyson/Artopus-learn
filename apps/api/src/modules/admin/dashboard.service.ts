import { analyticsService } from '../analytics/analytics.service.js';
import { BlogPost } from '../blogs/blog.model.js';
import { Event } from '../events/event.model.js';
import { ClassOffering } from '../classes/class.model.js';
import { serialize } from '../../lib/public-content.js';
export async function getDashboard() {
  const now = new Date();
  const [blogs, published, drafts, events, upcoming, classes, recentBlogs, recentEvents, recentClasses, pageViews] = await Promise.all([
    BlogPost.countDocuments(), BlogPost.countDocuments({ status: 'published', publishedAt: { $lte: now } }),
    BlogPost.countDocuments({ status: 'draft' }), Event.countDocuments(),
    Event.countDocuments({ status: 'published', startDate: { $gt: now } }), ClassOffering.countDocuments({ status: 'active' }),
    BlogPost.find().select('title status updatedAt').sort({ updatedAt: -1 }).limit(5).lean(),
    Event.find().select('title status updatedAt').sort({ updatedAt: -1 }).limit(5).lean(),
    ClassOffering.find().select('title status updatedAt').sort({ updatedAt: -1 }).limit(5).lean(),
    analyticsService.summary(),
  ]);
  const recent = [...recentBlogs.map(item => ({ ...item, kind: 'blogs' })), ...recentEvents.map(item => ({ ...item, kind: 'events' })), ...recentClasses.map(item => ({ ...item, kind: 'classes' }))].sort((a, b) => +b.updatedAt - +a.updatedAt).slice(0, 8);
  return { counts: { blogs, published, drafts, events, upcoming, classes }, recent: serialize(recent), pageViews };
}
