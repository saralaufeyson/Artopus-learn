import { useSearchParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { eventsQuery } from '../../services/public-queries';
import { QueryState } from '../../components/content/QueryState';
import { PageIntro } from '../../components/content/PublicPrimitives';
import { EventCard } from '../../features/events/components/EventCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/navigation/Pagination';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
export function EventsPage() {
  useDocumentTitle('Workshops, competitions and creative events');
  const [params, setParams] = useSearchParams();
  const status = ['upcoming', 'ongoing', 'completed'].includes(params.get('status') || '') ? params.get('status')! : 'upcoming';
  const type = ['workshop', 'competition', 'exhibition', 'challenge'].includes(params.get('type') || '') ? params.get('type')! : '';
  const page = Math.max(1, Number(params.get('page')) || 1);
  const query = useQuery(eventsQuery('limit=6&page=' + page + '&status=' + status + (type ? '&type=' + type : '')));
  const change = (key: string, value: string) => { const next = new URLSearchParams(params); if (value) next.set(key, value); else next.delete(key); next.delete('page'); setParams(next); };
  return <div className="container-art pb-20"><PageIntro eyebrow="Create. Connect. Celebrate." title="Good things happen when we create together." description="Explore workshops, competitions, exhibitions and creative challenges. There is always a new way to join the journey." />
    <div className="mb-8 flex flex-wrap items-center justify-between gap-5"><div className="flex flex-wrap gap-2" aria-label="Event timeline">{[['upcoming', 'Upcoming events'], ['ongoing', 'Happening now'], ['completed', 'Past events']].map(([value, label]) => <button key={value} className={status === value ? 'filter-chip active' : 'filter-chip'} aria-pressed={status === value} onClick={() => change('status', value!)}>{label}</button>)}</div><label className="flex items-center gap-3 text-sm text-muted">Event type<select className="field-control" value={type} onChange={event => change('type', event.target.value)}><option value="">All types</option><option value="workshop">Workshops</option><option value="competition">Competitions</option><option value="exhibition">Exhibitions</option><option value="challenge">Challenges</option></select></label></div>
    <QueryState pending={query.isPending} error={query.error} retry={() => { void query.refetch(); }}>{query.data && <><div className="card-grid">{query.data.items.map((event, index) => <EventCard key={event.id} event={event} index={index} />)}</div>{query.data.items.length === 0 && <EmptyState title="A little breathing room on the calendar" description="No published events match this view. Try another type or explore the past events." />}<Pagination page={page} total={query.data.total} limit={6} /></>}</QueryState></div>;
}
