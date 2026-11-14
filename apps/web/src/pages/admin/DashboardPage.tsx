import type { PageViewSummary } from '@artopus/shared';
import { PageViewAnalytics } from '../../components/admin/PageViewAnalytics';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../../services/api-client';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
interface Dashboard { pageViews: PageViewSummary; counts: Record<string, number>; recent: { id: string; title: string; status: string; kind: string; updatedAt: string }[] }
const labels = { blogs: 'Total articles', published: 'Published articles', drafts: 'Draft articles', events: 'Total events', upcoming: 'Upcoming events', classes: 'Active classes' };
export function DashboardPage() {
  useDocumentTitle('Dashboard');
  const query = useQuery({ queryKey: ['admin', 'dashboard'], queryFn: () => apiRequest<Dashboard>('/admin/dashboard') });
  return <div><p className="eyebrow">A little creativity, every day</p><h1 className="text-3xl font-bold">Your studio at a glance.</h1><p className="mt-3 text-muted">Keep your community up to date with what’s happening at Artopus.</p>
    {query.isPending && <p className="mt-8" role="status">Loading your studio…</p>}{query.isError && <button className="mt-8 text-error underline" onClick={() => void query.refetch()}>Unable to load. Try again.</button>}
    {query.data && <><div className="my-8 grid grid-cols-2 gap-4 md:grid-cols-3">{Object.entries(labels).map(([key, label]) => <div key={key} className="rounded-2xl border border-line bg-surface p-5"><p className="text-3xl font-bold text-accent">{query.data.counts[key]}</p><p className="mt-2 text-sm text-muted">{label}</p></div>)}</div><div className="flex flex-wrap gap-3">{[['blogs', 'Write an article'], ['events', 'Plan an event'], ['classes', 'Add a class']].map(([kind, text]) => <Link className="action-link action-secondary" to={'/admin/' + kind + '/new'} key={kind}>{text}</Link>)}</div><PageViewAnalytics summary={query.data.pageViews} /><section className="mt-10"><h2 className="mb-5 text-xl font-semibold">Recently updated</h2><div className="rounded-2xl border border-line bg-surface">{query.data.recent.length ? query.data.recent.map(item => <Link key={item.kind + item.id} to={'/admin/' + item.kind + '/' + item.id + '/edit'} className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-5 last:border-0 hover:bg-tint"><div><p className="font-semibold">{item.title}</p><p className="mt-1 text-xs text-muted capitalize">{item.kind} · {item.status}</p></div><span className="text-xs text-muted">{new Date(item.updatedAt).toLocaleString()}</span></Link>) : <p className="p-6 text-muted">Your saved content will appear here.</p>}</div></section></>}
  </div>;
}
