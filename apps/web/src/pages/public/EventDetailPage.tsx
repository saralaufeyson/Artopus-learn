import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { getEventDateStatus } from '@artopus/shared';
import { eventQuery } from '../../services/public-queries';
import { QueryState } from '../../components/content/QueryState';
import { ActionLink, Breadcrumb, DemoBadge, DetailFact, MediaImage, MediaGallery, RichText, formatDate, formatFee } from '../../components/content/PublicPrimitives';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
export function EventDetailPage() {
  const { slug = '' } = useParams();
  const query = useQuery(eventQuery(slug));
  const event = query.data;
  useDocumentTitle(event?.title || 'Creative event');
  const status = event ? getEventDateStatus(event.startDate, event.endDate) : undefined;
  const canRegister = event && status !== 'completed' && (!event.registrationDeadline || new Date(event.registrationDeadline).getTime() >= Date.now());
  return <QueryState pending={query.isPending} error={query.error} retry={() => { void query.refetch(); }}>{event && <article className="container-art py-10 md:py-14"><Breadcrumb href="/events" label="All events" /><div className="mb-5 flex flex-wrap gap-2"><span className="pill">{event.eventType}</span><span className="pill">{status}</span><DemoBadge isDemo={event.isDemo} /></div><h1 className="page-title max-w-4xl">{event.title}</h1><div className="mt-9 grid gap-10 lg:grid-cols-[1.5fr_1fr]"><div><div className="overflow-hidden rounded-3xl border border-line"><MediaImage image={event.poster} variant={1} /></div><div className="mt-8"><RichText html={event.description} /></div>{event.rules && <section className="mt-10"><h2 className="mb-5 text-2xl font-semibold">Things to know</h2><RichText html={event.rules} /></section>}{event.results && <section className="mt-10"><h2 className="mb-5 text-2xl font-semibold">Highlights and results</h2><RichText html={event.results} /></section>}<MediaGallery images={event.gallery} /></div>
    <aside className="self-start rounded-3xl border border-line bg-surface p-7 lg:sticky lg:top-6"><h2 className="text-xl font-semibold">The details</h2><dl className="mt-3"><DetailFact label="Date">{formatDate(event.startDate)}{formatDate(event.endDate) !== formatDate(event.startDate) ? ' - ' + formatDate(event.endDate) : ''}</DetailFact><DetailFact label="Location">{event.locationType} {event.location ? '- ' + event.location : ''}</DetailFact>{event.eligibility && <DetailFact label="Who can join">{event.eligibility}</DetailFact>}{event.registrationDeadline && <DetailFact label="Registration closes">{formatDate(event.registrationDeadline)}</DetailFact>}{event.fee && <DetailFact label="Entry fee">{formatFee(event.fee)}</DetailFact>}</dl><div className="mt-6">{canRegister && event.registrationUrl ? <ActionLink href={event.registrationUrl}>Register for this event</ActionLink> : <p className="text-sm leading-7 text-muted">{status === 'completed' ? 'This event has concluded. Explore the highlights or discover an upcoming event.' : event.isDemo ? 'This is a sample event. No registration is open.' : 'Registration is not currently open. Contact us for details.'}</p>}<div className="mt-5"><ActionLink href={status === 'completed' ? '/events' : '/contact'} secondary>{status === 'completed' ? 'Explore upcoming events' : 'Get in touch'}</ActionLink></div></div></aside></div></article>}</QueryState>;
}
