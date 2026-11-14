import type { BlogInput } from '../schemas/blog.schema.js';
import type { EventInput } from '../schemas/event.schema.js';
import type { ClassInput } from '../schemas/class.schema.js';
import type { SiteSettingsInput } from '../schemas/settings.schema.js';
import type { RecordMetadata } from './api.js';
export interface MediaAsset {
  id: string; publicId: string; url: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  fileSize: number; altText: string; createdAt: string;
}
interface ContentFlags { isDemo?: boolean; featured?: boolean }
export type BlogPost = Omit<BlogInput, 'coverImage' | 'gallery'> & RecordMetadata & ContentFlags & { coverImage?: MediaAsset; gallery: MediaAsset[] };
export type BlogDetail = BlogPost & { related: BlogPost[] };
export type ArtEvent = Omit<EventInput, 'poster' | 'gallery'> & RecordMetadata & ContentFlags & { poster?: MediaAsset; gallery: MediaAsset[] };
export type ClassOffering = Omit<ClassInput, 'thumbnail'> & RecordMetadata & ContentFlags & { thumbnail?: MediaAsset };
export type PublicSiteSettings = Omit<SiteSettingsInput, 'branding' | 'heroSection' | 'aboutSection' | 'featuredContent' | 'seoDefaults'> & {
  branding: Omit<SiteSettingsInput['branding'], 'logo'> & { logo?: MediaAsset };
  heroSection: Omit<SiteSettingsInput['heroSection'], 'image'> & { image?: MediaAsset };
  aboutSection: Omit<SiteSettingsInput['aboutSection'], 'image'> & { image?: MediaAsset };
  featuredContent: { classes: ClassOffering[]; events: ArtEvent[]; gallery: MediaAsset[] };
  seoDefaults: Omit<SiteSettingsInput['seoDefaults'], 'shareImage'> & { shareImage?: MediaAsset };
  demoMode?: boolean;
  benefits: { title: string; description: string }[];
};
export interface PublicRoute { path: string; updatedAt: string; isDemo: boolean }
