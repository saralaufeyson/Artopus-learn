import { FeaturedVideo } from '../../components/content/FeaturedVideo';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, PencilLine, Shapes, Palette, Heart } from 'lucide-react';
import { classesQuery, eventsQuery, blogsQuery } from '../../services/public-queries';
import { useSiteSettings } from '../../features/settings/hooks/useSiteSettings';
import { QueryState } from '../../components/content/QueryState';
import { ActionLink, SectionHeading, RichText, MediaImage, MediaGallery } from '../../components/content/PublicPrimitives';
import { ClassCard } from '../../features/classes/components/ClassCard';
import { EventCard } from '../../features/events/components/EventCard';
import { BlogCard } from '../../features/blogs/components/BlogCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
export function HomePage() {
  const settings = useSiteSettings();
  const classes = useQuery(classesQuery('limit=3'));
  const upcoming = useQuery(eventsQuery('limit=3&status=upcoming'));
  const past = useQuery(eventsQuery('limit=3&status=completed'));
  const blogs = useQuery(blogsQuery('limit=3'));
  useDocumentTitle('Drawing classes, art and a little imagination');
  const s = settings.data;
  const icons = [PencilLine, Shapes, Palette, Heart];
  const all = [settings, classes, upcoming, past, blogs];
  return <QueryState pending={all.some(query => query.isPending)} error={all.find(query => query.error)?.error || null} retry={() => { all.forEach(query => { void query.refetch(); }); }}>
    {s && <><section className="ambient-hero overflow-hidden border-b border-line"><div className="container-art grid items-center gap-10 py-14 md:py-20 lg:grid-cols-[1.1fr_1fr]">
      <div><p className="eyebrow flex items-center gap-2"><Sparkles size={16} aria-hidden="true" />A space for your imagination</p><h1 className="hero-title">{s.heroSection.heading}</h1><p className="mt-6 max-w-xl text-lg leading-8 text-muted">{s.heroSection.description}</p><div className="mt-8 flex flex-wrap gap-3"><ActionLink href={s.heroSection.primaryCta?.href}>{s.heroSection.primaryCta?.label}</ActionLink><ActionLink href={s.heroSection.secondaryCta?.href} secondary>{s.heroSection.secondaryCta?.label}</ActionLink></div><div className="mt-8 flex items-center gap-3 text-xs font-medium tracking-wide text-muted"><span className="h-px w-10 bg-accent" />Make a mark. Find your own way.</div></div>
      <div className="hero-art"><MediaImage image={s.heroSection.image} /><span className="art-note"><PencilLine size={16} aria-hidden="true" />A blank page. Endless possibilities.</span></div>
    </div></section>
    <div className="container-art"><section className="section-space grid items-center gap-10 lg:grid-cols-[.7fr_1fr]"><div><p className="eyebrow">Hello, creative soul</p><h2 className="section-title">{s.aboutSection.heading}</h2></div><div><RichText html={s.aboutSection.content} /><ActionLink href="/about" secondary>Meet Artopus</ActionLink></div></section>
    <FeaturedVideo video={s.featuredVideo} />
    <section className="section-space border-t border-line"><SectionHeading eyebrow="Find your starting point" title="A little learning. A lot of creating." description="Explore creative programs for curious minds and growing imaginations." href="/classes" linkLabel="All drawing classes" /><div className="card-grid">{(s.featuredContent.classes.length ? s.featuredContent.classes : classes.data?.items)?.map((offering, index) => <ClassCard key={offering.id} offering={offering} index={index} />)}</div>{classes.data?.items.length === 0 && <EmptyState title="New programs are on their way" description="Get in touch to ask about current drawing classes." />}</section>
    <section className="section-space border-t border-line"><SectionHeading eyebrow="The Artopus approach" title="More than a finished picture." /><div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">{s.benefits.map((benefit, index) => { const Icon = icons[index % icons.length]!; return <div key={benefit.title}><span className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-tint text-accent"><Icon size={23} aria-hidden="true" /></span><h3 className="text-lg font-semibold">{benefit.title}</h3><p className="mt-3 text-sm leading-7 text-muted">{benefit.description}</p></div>; })}</div></section>
    <section className="section-space border-t border-line"><SectionHeading eyebrow="Come create with us" title="Something to look forward to." href="/events" linkLabel="Explore events" /><div className={upcoming.data?.items.length === 1 ? 'feature-event-grid' : 'card-grid'}>{upcoming.data?.items.map((event, index) => <EventCard key={event.id} event={event} index={index} />)}</div>{upcoming.data?.items.length === 0 && <EmptyState title="Watch this space" description="Published upcoming workshops and events will appear here." />}</section>
    <section className="section-space border-t border-line"><SectionHeading eyebrow="Our creative journey" title="Small moments. Colourful memories." href="/events?status=completed" linkLabel="Explore past events" /><div className={past.data?.items.length === 1 ? 'feature-event-grid' : 'card-grid'}>{past.data?.items.map((event, index) => <EventCard key={event.id} event={event} index={index + 2} />)}</div>{past.data?.items.length === 0 && <EmptyState title="Our journey is taking shape" description="Past event highlights will appear here when published." />}<MediaGallery images={s.featuredContent.gallery} /></section>
    <section className="section-space border-t border-line"><SectionHeading eyebrow="From the creative journal" title="Ideas worth making time for." href="/blog" linkLabel="Read the journal" /><div className="card-grid">{blogs.data?.items.map((post, index) => <BlogCard key={post.id} post={post} index={index} />)}</div>{blogs.data?.items.length === 0 && <EmptyState title="Stories are on their way" description="Discover art ideas and creative experiences here soon." />}</section>
    <section className="cta-panel mb-16"><p className="eyebrow">A little nudge to begin</p><h2 className="section-title">{s.finalCta?.heading}</h2><p className="mx-auto mt-4 max-w-xl leading-7 text-muted">{s.finalCta?.description}</p><div className="mt-7 flex justify-center"><ActionLink href={s.finalCta?.action?.href}>{s.finalCta?.action?.label}</ActionLink></div></section></div></>}
  </QueryState>;
}
