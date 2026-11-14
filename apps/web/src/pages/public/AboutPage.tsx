import { FeaturedVideo } from '../../components/content/FeaturedVideo';
import { Palette, PencilLine, Shapes, Heart } from 'lucide-react';
import { useSiteSettings } from '../../features/settings/hooks/useSiteSettings';
import { QueryState } from '../../components/content/QueryState';
import { ActionLink, PageIntro, RichText, MediaImage } from '../../components/content/PublicPrimitives';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
export function AboutPage() {
  const query = useSiteSettings();
  const settings = query.data;
  useDocumentTitle('About Artopus');
  const icons = [Palette, PencilLine, Shapes, Heart];
  return <QueryState pending={query.isPending} error={query.error} retry={() => { void query.refetch(); }}>{settings && <div className="container-art pb-20"><PageIntro eyebrow="The story behind the colour" title="A space to create, explore and grow." description={settings.branding.tagline} /><section className="grid items-center gap-10 lg:grid-cols-2"><div className="overflow-hidden rounded-3xl border border-line"><MediaImage image={settings.aboutSection.image} variant={2} /></div><div><h2 className="section-title">{settings.aboutSection.heading}</h2><div className="mt-6"><RichText html={settings.aboutSection.content} /></div><div className="mt-7"><ActionLink href="/classes">Explore the learning journey</ActionLink></div></div></section><FeaturedVideo video={settings.featuredVideo} /><section className="section-space"><h2 className="section-title">Room for every creative beginning.</h2><div className="mt-9 grid gap-7 sm:grid-cols-2">{settings.benefits.map((benefit, index) => { const Icon = icons[index % icons.length]!; return <div key={benefit.title} className="rounded-2xl border border-line bg-surface p-7"><Icon size={25} className="mb-4 text-accent" aria-hidden="true" /><h3 className="text-xl font-semibold">{benefit.title}</h3><p className="mt-3 leading-7 text-muted">{benefit.description}</p></div>; })}</div></section><section className="cta-panel"><h2 className="section-title">Let's make something meaningful.</h2><p className="mt-4 text-muted">Explore a class or reach out to learn more about Artopus.</p><div className="mt-7 flex flex-wrap justify-center gap-3"><ActionLink href="/events">Discover creative events</ActionLink><ActionLink href="/contact" secondary>Say hello</ActionLink></div></section></div>}</QueryState>;
}
