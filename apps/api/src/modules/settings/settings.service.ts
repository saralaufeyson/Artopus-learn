import type { PublicSiteSettings } from '@artopus/shared';
import { SiteSettings } from './settings.model.js';
import { ApiError } from '../../lib/api-error.js';
import { serialize, visibleBlogs } from '../../lib/public-content.js';
import { siteSettingsInputSchema, objectIdSchema } from '@artopus/shared';
import { validateMedia } from '../../lib/admin-content.js';
import { sanitizeRichText } from '../../lib/sanitize-rich-text.js';
import { BlogPost } from '../blogs/blog.model.js';
import { Event } from '../events/event.model.js';
import { ClassOffering } from '../classes/class.model.js';
const initialSettings = { demoMode: false, branding: { name: 'Artopus Learn', tagline: 'Create • Explore • Learn • Shop • Grow' }, heroSection: { heading: 'Every Artist Starts Somewhere.', description: '' }, aboutSection: { heading: 'About Artopus India', content: '' }, benefits: [], featuredContent: { classes: [], events: [], gallery: [] }, registrationLinks: {}, socialLinks: {}, contactDetails: {}, seoDefaults: { title: 'Artopus Learn', description: '', siteUrl: 'https://learn.artopusindia.com' } };
export async function initializeSiteSettings() {
  await SiteSettings.updateOne({ key: 'site' }, { $setOnInsert: initialSettings }, { upsert: true, runValidators: true });
}
export const settingsService = {
  async getPublic(): Promise<PublicSiteSettings> {
    const settings = await SiteSettings.findOne({ key: 'site' }).select('-key').populate([
      { path: 'branding.logo heroSection.image aboutSection.image seoDefaults.shareImage featuredContent.gallery' },
      { path: 'featuredContent.classes', match: { status: 'active' }, populate: { path: 'thumbnail' } },
      { path: 'featuredContent.events', match: { status: 'published' }, populate: { path: 'poster gallery' } },
    ]).lean();
    if (!settings) throw new ApiError(404, 'SITE_NOT_CONFIGURED', 'Site content has not been configured yet.');
    return serialize<PublicSiteSettings>(settings);
  },
  async routes() {
    const [blogs, events, classes] = await Promise.all([
      BlogPost.find(visibleBlogs()).select('slug updatedAt isDemo').lean(),
      Event.find({ status: 'published' }).select('slug updatedAt isDemo').lean(),
      ClassOffering.find({ status: 'active' }).select('slug updatedAt isDemo').lean(),
    ]);
    return [blogs.map(item => ({ path: '/blog/' + item.slug, updatedAt: item.updatedAt, isDemo: item.isDemo })),
      events.map(item => ({ path: '/events/' + item.slug, updatedAt: item.updatedAt, isDemo: item.isDemo })),
      classes.map(item => ({ path: '/classes/' + item.slug, updatedAt: item.updatedAt, isDemo: item.isDemo }))].flat();
  },
  async getAdmin() {
    const settings = await SiteSettings.findOne({ key: 'site' }).select('-key').lean();
    if (!settings) return initialSettings;
    return serialize(settings);
  },
  async update(body: unknown) {
    const values = siteSettingsInputSchema.parse(body);
    await validateMedia([values.branding.logo, values.heroSection.image, values.aboutSection.image, values.seoDefaults.shareImage, ...values.featuredContent.gallery]);
    for (const [model, ids] of [[ClassOffering, values.featuredContent.classes], [Event, values.featuredContent.events]] as const) {
      ids.forEach(id => objectIdSchema.parse(id));
      if (await model.countDocuments({ _id: { $in: ids } }) !== new Set(ids).size) throw new ApiError(400, 'INVALID_REFERENCE', 'A selected featured item is not available.');
    }
    values.aboutSection.content = sanitizeRichText(values.aboutSection.content);
    const record = await SiteSettings.findOne({ key: 'site' });
    if (record) { record.overwrite({ ...values, key: 'site', createdAt: record.createdAt }); await record.save(); }
    else await SiteSettings.create({ ...values, key: 'site' });
    return this.getAdmin();
  },
};
