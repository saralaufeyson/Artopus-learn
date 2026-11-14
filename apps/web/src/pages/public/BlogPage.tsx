import { useSearchParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { blogsQuery, categoriesQuery } from '../../services/public-queries';
import { QueryState } from '../../components/content/QueryState';
import { PageIntro } from '../../components/content/PublicPrimitives';
import { BlogCard } from '../../features/blogs/components/BlogCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/navigation/Pagination';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
export function BlogPage() {
  useDocumentTitle('The creative journal');
  const [params, setParams] = useSearchParams();
  const search = (params.get('search') || '').slice(0, 100);
  const category = (params.get('category') || '').slice(0, 100);
  const page = Math.max(1, Number(params.get('page')) || 1);
  const featured = params.get('featured') === 'true';
  const api = new URLSearchParams({ limit: '6', page: String(page) });
  if (search) api.set('search', search);
  if (category) api.set('category', category);
  if (featured) api.set('featured', 'true');
  const query = useQuery(blogsQuery(api.toString()));
  const categories = useQuery(categoriesQuery());
  const change = (key: string, value: string) => { const next = new URLSearchParams(params); if (value) next.set(key, value); else next.delete(key); next.delete('page'); setParams(next); };
  return <div className="container-art pb-20"><PageIntro eyebrow="The creative journal" title="Fresh ideas for curious minds." description="Art tips, little experiments and stories from the creative journey. Take a moment, find an idea, and make it your own." />
    <div className="mb-7 grid min-w-0 grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_auto]"><form key={search} className="flex min-w-0 gap-2" role="search" onSubmit={event => { event.preventDefault(); change('search', String(new FormData(event.currentTarget).get('search') || '').trim()); }}><label htmlFor="blog-search" className="sr-only">Search articles</label><input id="blog-search" name="search" type="search" maxLength={100} defaultValue={search} placeholder="Find an idea, a technique, a little inspiration..." className="field-control min-w-0 flex-1" /><button type="submit" className="action-link action-primary"><Search size={17} aria-hidden="true" /><span>Search</span></button></form><label className="flex items-center gap-2 text-sm text-muted"><input type="checkbox" checked={featured} onChange={event => change('featured', event.target.checked ? 'true' : '')} className="h-4 w-4 accent-primary" />Featured articles</label></div>
    <div className="mb-8 flex flex-wrap gap-2" aria-label="Article categories"><button className={!category ? 'filter-chip active' : 'filter-chip'} aria-pressed={!category} onClick={() => change('category', '')}>All stories</button>{categories.data?.map(value => <button key={value} className={category === value ? 'filter-chip active' : 'filter-chip'} aria-pressed={category === value} onClick={() => change('category', value)}>{value}</button>)}</div>
    <QueryState pending={query.isPending} error={query.error || categories.error} retry={() => { void query.refetch(); void categories.refetch(); }}>{query.data && <><p className="mb-5 text-sm text-muted" aria-live="polite">{query.data.total} {query.data.total === 1 ? 'story' : 'stories'}{search ? ' for "' + search + '"' : ''}</p><div className="card-grid">{query.data.items.map((post, index) => <BlogCard key={post.id} post={post} index={index} />)}</div>{query.data.items.length === 0 && <EmptyState title="No stories found just yet" description="Try another search or category. There is always another idea to explore." />}<Pagination page={page} total={query.data.total} limit={6} /></>}</QueryState></div>;
}
