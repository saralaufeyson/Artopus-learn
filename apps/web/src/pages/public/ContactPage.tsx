import { Mail, Phone, MapPin, ArrowUpRight, Instagram, Youtube, ShoppingBag, PencilLine } from 'lucide-react';
import { safeHref } from '@artopus/shared';
import { useSiteSettings } from '../../features/settings/hooks/useSiteSettings';
import { QueryState } from '../../components/content/QueryState';
import { ActionLink, PageIntro } from '../../components/content/PublicPrimitives';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
export function ContactPage() {
  const query = useSiteSettings();
  const settings = query.data;
  useDocumentTitle('Contact Artopus');
  const socials = settings ? [
    { label: 'Artopus on Instagram', description: 'A window into our creative world.', href: settings.socialLinks.instagram, icon: Instagram },
    { label: 'Drawing classes', description: 'Follow our learning journey.', href: settings.socialLinks.drawingClassesInstagram, icon: PencilLine },
    { label: 'Watch on YouTube', description: 'Explore more from Artopus India.', href: settings.socialLinks.youtube, icon: Youtube },
    { label: 'Visit the Artopus shop', description: 'Explore the Artopus India store.', href: settings.socialLinks.shop, icon: ShoppingBag },
  ] : [];
  return <QueryState pending={query.isPending} error={query.error} retry={() => { void query.refetch(); }}>{settings && <div className="container-art pb-20"><PageIntro eyebrow="A conversation is a good beginning" title="Let's talk about what you could create." description="Have a question about drawing classes, an event or learning with Artopus? Find us through the channels below." /><div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]"><section className="rounded-3xl border border-line bg-surface p-8"><h2 className="text-2xl font-semibold">A little closer to your next idea.</h2><p className="mt-4 leading-7 text-muted">Ask about current programs, schedules and registration. You do not need to create an account.</p><div className="mt-6 grid gap-5 text-sm">{settings.contactDetails.email && <a className="flex items-center gap-3 text-accent" href={'mailto:' + settings.contactDetails.email}><Mail size={20} aria-hidden="true" />{settings.contactDetails.email}</a>}{settings.contactDetails.phone && <a className="flex items-center gap-3 text-accent" href={'tel:' + settings.contactDetails.phone.replace(/[^+\d]/g, '')}><Phone size={20} aria-hidden="true" />{settings.contactDetails.phone}</a>}{settings.contactDetails.address && <p className="flex items-start gap-3 text-muted"><MapPin size={20} className="shrink-0" aria-hidden="true" />{settings.contactDetails.address}</p>}</div><div className="mt-7 flex flex-wrap gap-3"><ActionLink href={settings.registrationLinks.classes}>Class registration</ActionLink><ActionLink href={settings.registrationLinks.inquiry || settings.socialLinks.drawingClassesInstagram} secondary>Ask about drawing classes</ActionLink></div></section><section className="grid gap-4 sm:grid-cols-2" aria-label="Artopus social channels">{socials.map(({ label, description, href, icon: Icon }) => safeHref(href) ? <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-line bg-surface p-6 hover:border-accent"><div className="flex items-center justify-between text-accent"><Icon size={24} aria-hidden="true" /><ArrowUpRight size={18} aria-hidden="true" /></div><h2 className="mt-6 text-lg font-semibold">{label}</h2><p className="mt-2 text-sm leading-7 text-muted">{description}</p></a> : null)}</section></div></div>}</QueryState>;
}
