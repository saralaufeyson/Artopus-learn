import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router';
import { classesQuery } from '../../services/public-queries';
import { QueryState } from '../../components/content/QueryState';
import { PageIntro } from '../../components/content/PublicPrimitives';
import { ClassCard } from '../../features/classes/components/ClassCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/navigation/Pagination';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
export function ClassesPage() {
  useDocumentTitle('Drawing classes');
  const [params, setParams] = useSearchParams();
  const mode = ['online', 'offline', 'hybrid'].includes(params.get('mode') || '') ? params.get('mode')! : '';
  const page = Math.max(1, Number(params.get('page')) || 1);
  const query = useQuery(classesQuery('limit=12&page=' + page + (mode ? '&mode=' + mode : '')));
  return <div className="container-art pb-20"><PageIntro eyebrow="A place to grow" title="Your creativity has room to grow." description="Explore drawing and painting, discover new ways to express yourself, and find a program that feels like your next step." /><div className="mb-8 flex flex-wrap gap-2" aria-label="Class mode filters">{[['', 'All programs'], ['online', 'Online'], ['offline', 'In person'], ['hybrid', 'Online & in person']].map(([value, label]) => <button key={value} className={mode === value ? 'filter-chip active' : 'filter-chip'} aria-pressed={mode === value} onClick={() => setParams(value ? { mode: value } : {})}>{label}</button>)}</div>
    <QueryState pending={query.isPending} error={query.error} retry={() => { void query.refetch(); }}>{query.data && <><div className="card-grid">{query.data.items.map((offering, index) => <ClassCard key={offering.id} offering={offering} index={index} />)}</div>{query.data.items.length === 0 && <EmptyState title="No programs in this view yet" description="Try another mode or contact us about current classes." />}<Pagination page={page} total={query.data.total} limit={12} /></>}</QueryState></div>;
}
