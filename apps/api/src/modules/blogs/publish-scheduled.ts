import { BlogPost } from './blog.model.js';
export async function publishScheduledBlogs() {
  const now = new Date();
  return BlogPost.updateMany({ status: 'scheduled', scheduledAt: { $lte: now } },
    [{ $set: { status: 'published', publishedAt: '$scheduledAt', updatedAt: now } }, { $unset: 'scheduledAt' }]);
}
