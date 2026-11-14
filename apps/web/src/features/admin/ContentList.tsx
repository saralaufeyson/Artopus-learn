import { useState } from 'react';
import { Link } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { PaginatedResult } from '@artopus/shared';
import { apiRequest } from '../../services/api-client';
import { authenticatedRequest } from '../auth/services/auth.service';
import { editorConfigs, type ContentKind } from './editor-config';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
interface Item { id: string; title: string; status: string; updatedAt: string; isDemo?: boolean; displayOrder?: number }
export function ContentList({ kind }: { kind: ContentKind }) {
  const config = editorConfigs[kind]; useDocumentTitle('Manage ' + config.title);
  const [page, setPage] = useState(1); const [search, setSearch] = useState(''); const [filter, setFilter] = useState(''); const [status, setStatus] = useState('');
  const [archive, setArchive] = useState<Item>(); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const client = useQueryClient();
  const query = useQuery({ queryKey: ['admin', kind, 'list', page, filter, status], queryFn: () => apiRequest<PaginatedResult<Item>>('/admin/' + kind + '?' + new URLSearchParams({ page: String(page), limit: '12', search: filter, ...(status ? { status } : {}) })) });
  async function confirmArchive() {
    if (!archive) return; setBusy(true); setError('');
    try { await authenticatedRequest('/admin/' + kind + '/' + archive.id, { method: 'DELETE' }); setArchive(undefined); await client.invalidateQueries({ predicate: query => query.queryKey[0] !== 'admin-session' }); }
    catch (error) { setError(error instanceof Error ? error.message : 'Unable to archive.'); } finally { setBusy(false); }
  }
  return <div>
    <div className="mb-7 flex flex-wrap items-end justify-between gap-5"><div><p className="eyebrow">Your creative studio</p><h1 className="text-3xl font-bold">{config.title}</h1><p className="mt-3 text-sm text-muted">Draft, refine, and share something inspiring.</p></div><Link className="action-link action-primary" to={'/admin/' + kind + '/new'}>Create {config.singular}</Link></div>
    <form className="mb-6 flex flex-wrap gap-3" onSubmit={event => { event.preventDefault(); setPage(1); setFilter(search); }}><label className="min-w-0 flex-1"><span className="sr-only">Search {config.title}</span><input className="field-control w-full" value={search} onChange={event => setSearch(event.target.value)} placeholder={'Search ' + config.title.toLowerCase()} /></label><label><span className="sr-only">Status filter</span><select className="field-control" value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}><option value="">All statuses</option>{(kind === 'blogs' ? ['draft', 'published', 'scheduled', 'archived'] : kind === 'classes' ? ['draft', 'active', 'inactive', 'archived'] : ['draft', 'published', 'archived']).map(value => <option key={value}>{value}</option>)}</select></label><button className="action-link action-secondary" type="submit">Search</button></form>
    {error && <p role="alert" className="mb-4 text-error">{error}</p>}
    {archive && <div role="alertdialog" aria-label="Archive confirmation" className="mb-6 rounded-xl border border-error-line bg-error-surface p-5"><p>Archive “{archive.title}”? It will be hidden from visitors. You can restore it in the editor.</p><div className="mt-4 flex gap-5"><button className="text-error underline" disabled={busy} onClick={() => void confirmArchive()}>{busy ? 'Archiving…' : 'Confirm archive'}</button><button className="underline" onClick={() => setArchive(undefined)}>Cancel</button></div></div>}
    {query.isPending && <p role="status">Loading your content…</p>}{query.isError && <button className="text-error underline" onClick={() => void query.refetch()}>{query.error.message} Try again.</button>}
    {query.data && <><div className="overflow-hidden rounded-2xl border border-line bg-surface">{query.data.items.length === 0 ? <p className="p-8 text-muted">No items found. Create your first {config.singular} or change the filters.</p> : query.data.items.map(item => <article key={item.id} className="flex flex-wrap items-center justify-between gap-5 border-b border-line p-5 last:border-0"><div className="min-w-0"><Link className="font-semibold hover:text-accent" to={'/admin/' + kind + '/' + item.id + '/edit'}>{item.title}</Link><div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted"><span className="pill">{item.status}</span>{item.isDemo && <span className="demo-badge">Sample</span>}<span>Updated {new Date(item.updatedAt).toLocaleDateString()}</span>{kind === 'classes' && <span>Order {item.displayOrder}</span>}</div></div><div className="flex gap-5 text-sm"><Link className="text-accent underline" to={'/admin/' + kind + '/' + item.id + '/edit'}>Edit</Link>{item.status !== 'archived' && <button className="text-muted underline" onClick={() => setArchive(item)}>Archive</button>}</div></article>)}</div><div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-sm"><span className="text-muted">{query.data.total} items · Page {page}</span><div className="flex gap-3"><button className="filter-chip" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button><button className="filter-chip" disabled={page * 12 >= query.data.total} onClick={() => setPage(page + 1)}>Next</button></div></div></>}
  </div>;
}
