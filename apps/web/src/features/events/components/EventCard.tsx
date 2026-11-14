import { Link } from 'react-router';
import { CalendarDays, ArrowUpRight } from 'lucide-react';
import { getEventDateStatus, type ArtEvent } from '@artopus/shared';
import { DemoBadge, MediaImage, formatDate } from '../../../components/content/PublicPrimitives';
export function EventCard({ event, index = 1 }: { event: ArtEvent; index?: number }) {
  const status = getEventDateStatus(event.startDate, event.endDate);
  return <article className="content-card"><Link to={'/events/' + event.slug} className="block aspect-[8/5] overflow-hidden" aria-label={'View ' + event.title}><MediaImage image={event.poster} variant={index} /></Link><div className="p-6">
    <div className="mb-4 flex flex-wrap gap-2"><span className="pill">{event.eventType}</span><span className="pill">{status}</span><DemoBadge isDemo={event.isDemo} /></div>
    <h3 className="card-title"><Link to={'/events/' + event.slug}>{event.title}</Link></h3>
    <p className="mt-3 line-clamp-2 text-sm leading-7 text-muted">{event.description.replace(/<[^>]*>/g, ' ')}</p>
    <p className="mt-5 flex items-center gap-2 text-sm text-muted"><CalendarDays size={16} aria-hidden="true" /><time dateTime={event.startDate}>{formatDate(event.startDate)}</time></p>
    <Link to={'/events/' + event.slug} className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-accent">View event<ArrowUpRight size={17} aria-hidden="true" /></Link>
  </div></article>;
}
