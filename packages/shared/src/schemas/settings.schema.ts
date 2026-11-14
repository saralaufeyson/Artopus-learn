import { z } from 'zod';
import { youtubeVideo } from '../utils/youtube-video.js';
import { safeHref } from '../utils/safe-href.js';
import { externalUrlSchema, objectIdSchema } from './common.schema.js';
const ctaSchema = z.object({ label: z.string().max(100), href: z.string().max(1000).refine(value => !!safeHref(value), 'Use a website path or HTTPS link') });
export const siteSettingsInputSchema = z.object({
  featuredVideo: z.object({ title: z.string().trim().min(1).max(150), description: z.string().max(1000).optional(), url: z.string().max(1000).refine(value => !!youtubeVideo(value), 'Use an HTTPS YouTube video or Shorts link') }).optional(),
  demoMode: z.boolean().optional(),
  benefits: z.array(z.object({ title: z.string().min(1).max(150), description: z.string().max(1000) })).max(12).default([]),
  branding: z.object({ name: z.string().min(1).max(100), tagline: z.string().max(200), ownershipStatement: z.string().max(500).optional(), logo: objectIdSchema.optional() }),
  heroSection: z.object({ heading: z.string().max(200), description: z.string().max(1000), image: objectIdSchema.optional(), primaryCta: ctaSchema.optional(), secondaryCta: ctaSchema.optional() }),
  aboutSection: z.object({ heading: z.string().max(200), content: z.string().max(50_000), image: objectIdSchema.optional() }),
  featuredContent: z.object({ classes: z.array(objectIdSchema).max(12), events: z.array(objectIdSchema).max(12), gallery: z.array(objectIdSchema).max(30) }),
  finalCta: z.object({ heading: z.string().max(200), description: z.string().max(1000), action: ctaSchema.optional() }).optional(),
  registrationLinks: z.object({ classes: externalUrlSchema.optional(), inquiry: externalUrlSchema.optional() }),
  socialLinks: z.object({ instagram: externalUrlSchema.optional(), drawingClassesInstagram: externalUrlSchema.optional(), youtube: externalUrlSchema.optional(), shop: externalUrlSchema.optional() }),
  contactDetails: z.object({ email: z.email().optional(), phone: z.string().max(30).optional(), address: z.string().max(1000).optional() }),
  seoDefaults: z.object({ title: z.string().max(70), description: z.string().max(180), siteUrl: externalUrlSchema, shareImage: objectIdSchema.optional() }),
});
export type SiteSettingsInput = z.infer<typeof siteSettingsInputSchema>;
