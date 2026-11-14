import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { safeHref, type MediaAsset } from '@artopus/shared';
import { StudioArtwork } from './StudioArtwork';

export function SectionHeading({ eyebrow, title, description, href, linkLabel = 'Explore more' }: { eyebrow?: string; title: string; description?: string; href?: string; linkLabel?: string }) {
  return <div className="mb-8 flex flex-wrap items-end justify-between gap-5"><div className="max-w-2xl">{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2 className="section-title">{title}</h2>{description && <p className="mt-3 leading-7 text-muted">{description}</p>}</div>{href && <Link to={href} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-accent">{linkLabel}<ArrowRight size={17} aria-hidden="true" /></Link>}</div>;
}
export function ActionLink({ href, children, secondary = false }: { href?: string; children: ReactNode; secondary?: boolean }) {
  const url = safeHref(href);
  if (!url) return null;
  const className = secondary ? 'action-link action-secondary' : 'action-link action-primary';
  return url.startsWith('/') ? <Link to={url} className={className}>{children}<ArrowRight size={17} aria-hidden="true" /></Link> : <a href={url} target="_blank" rel="noopener noreferrer" className={className}>{children}<ArrowUpRight size={17} aria-hidden="true" /></a>;
}
export function DemoBadge({ isDemo }: { isDemo?: boolean }) { return isDemo ? <span className="demo-badge">Demo content</span> : null; }
export function MediaImage({ image, variant = 0, className = '' }: { image?: MediaAsset; variant?: number; className?: string }) {
  const src = safeHref(image?.url);
  return src ? <img src={src} alt={image?.altText || ''} loading="lazy" width="800" height="560" className={'h-full w-full object-cover ' + className} /> : <div className={'art-preview ' + className}><StudioArtwork variant={variant} /><span className="art-caption">Illustrative preview</span></div>;
}
export function RichText({ html }: { html?: string }) { return html ? <div className="prose-art" dangerouslySetInnerHTML={{ __html: html }} /> : null; }
export function MediaGallery({ images }: { images: MediaAsset[] }) { return images.length ? <div className="mt-8 grid gap-4 sm:grid-cols-2">{images.map(image => <figure key={image.id} className="overflow-hidden rounded-2xl border border-line"><MediaImage image={image} /><figcaption className="bg-surface p-3 text-sm text-muted">{image.altText}</figcaption></figure>)}</div> : null; }
export function DetailFact({ label, children }: { label: string; children: ReactNode }) { return <div className="border-b border-line py-4 last:border-0"><dt className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</dt><dd className="mt-1.5 font-medium text-ink">{children}</dd></div>; }
export function Breadcrumb({ label, href }: { label: string; href: string }) { return <Link to={href} className="mb-7 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted hover:text-accent"><span aria-hidden="true">&larr;</span> {label}</Link>; }
export function PageIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) { return <header className="page-intro"><p className="eyebrow">{eyebrow}</p><h1 className="page-title">{title}</h1><p className="mt-5 max-w-2xl text-base leading-8 text-muted md:text-lg">{description}</p></header>; }
export const formatDate = (date: string) => new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }).format(new Date(date));
export const formatFee = (fee?: { amount: number; currency: string }) => fee ? fee.amount === 0 ? 'Free' : new Intl.NumberFormat('en-IN', { style: 'currency', currency: fee.currency, maximumFractionDigits: 0 }).format(fee.amount) : 'Contact us for details';

export const formatClassMode = (mode: string) => mode === 'hybrid' ? 'Online & in person' : mode === 'offline' ? 'In person' : 'Online';
