import { PageViewCounter } from './PageViewCounter';
import { Link } from 'react-router';
import { ArrowUpRight, Palette } from 'lucide-react';
import { safeHref } from '@artopus/shared';
import { useSiteSettings } from '../../features/settings/hooks/useSiteSettings';
export function SiteFooter() {
  const { data: settings } = useSiteSettings();
  const channels = settings ? [['Instagram', settings.socialLinks.instagram], ['Drawing classes', settings.socialLinks.drawingClassesInstagram], ['YouTube', settings.socialLinks.youtube], ['Artopus shop', settings.socialLinks.shop]] : [];
  return <footer className="border-t border-line bg-surface"><div className="container-art grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
    <div><Link to="/" className="flex items-center gap-2 text-xl font-bold"><Palette className="text-accent" aria-hidden="true" />{settings?.branding.name || 'Artopus Learn'}</Link><p className="mt-4 max-w-sm text-sm leading-7 text-muted">{settings?.branding.tagline}</p><p className="mt-5 text-xs text-muted">A little curiosity can go a long way.</p></div>
    <div><h2 className="footer-heading">Explore</h2><nav aria-label="Footer navigation" className="mt-4 grid gap-3 text-sm text-muted">{[['/classes', 'Drawing classes'], ['/events', 'Events and workshops'], ['/blog', 'Creative journal'], ['/about', 'About Artopus'], ['/contact', 'Get in touch']].map(([href, label]) => <Link key={href} to={href!} className="hover:text-accent">{label}</Link>)}</nav></div>
    <div><h2 className="footer-heading">Stay connected</h2><div className="mt-4 grid gap-3 text-sm text-muted">{channels.map(([label, href]) => safeHref(href) ? <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-accent">{label}<ArrowUpRight size={14} aria-hidden="true" /></a> : null)}{settings?.contactDetails.email && <a href={'mailto:' + settings.contactDetails.email}>{settings.contactDetails.email}</a>}</div></div>
  </div><div className="container-art flex flex-wrap justify-between gap-4 border-t border-line py-6 text-xs text-muted"><p className="max-w-3xl leading-6">{settings?.branding.ownershipStatement || 'Artopus India. Create something of your own.'}</p><div className="flex flex-wrap items-center gap-x-6 gap-y-3"><PageViewCounter /><Link to="/admin" className="underline">Administrator access</Link></div></div></footer>;
}
