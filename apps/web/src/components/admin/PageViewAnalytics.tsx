import { Link } from 'react-router';
import { Eye } from 'lucide-react';
import type { PageViewSummary } from '@artopus/shared';
const formatNumber = (value: number) => new Intl.NumberFormat('en-IN').format(value);
const names: Record<string, string> = { '/': 'Home', '/about': 'About Artopus', '/contact': 'Contact', '/blog': 'Creative journal', '/classes': 'Drawing classes', '/events': 'Events and workshops' };
export function PageViewAnalytics({ summary }: { summary: PageViewSummary }) {
  return <section className="mt-10 rounded-2xl border border-line bg-surface p-5 sm:p-7" aria-labelledby="page-views-heading">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><h2 id="page-views-heading" className="text-xl font-semibold">Website page views</h2><p className="mt-2 max-w-xl text-sm leading-6 text-muted">Visits to public pages since counting began. Returning visits and page reloads count again. This is not a count of unique people.</p></div><div className="flex items-center gap-3 rounded-2xl bg-tint px-5 py-4"><Eye className="text-accent" aria-hidden="true" /><div><p className="text-3xl font-bold text-accent">{formatNumber(summary.total)}</p><p className="text-xs text-muted">Total page views</p></div></div></div>
    {summary.pages.length ? <div className="mt-6 overflow-x-auto"><table className="w-full text-left text-sm"><caption className="mb-3 text-left text-xs text-muted">Most viewed pages · up to 10 pages</caption><thead><tr className="border-b border-line"><th scope="col" className="py-3 pr-4 font-semibold">Page</th><th scope="col" className="py-3 text-right font-semibold">Views</th></tr></thead><tbody>{summary.pages.map(page => <tr key={page.path} className="border-b border-line last:border-0"><th scope="row" className="py-4 pr-4 font-normal"><Link to={page.path} className="break-all text-accent underline">{names[page.path] || page.path}</Link></th><td className="py-4 text-right tabular-nums">{formatNumber(page.views)}</td></tr>)}</tbody></table></div> : <p className="mt-6 text-sm text-muted">No page views yet. The count starts when someone opens a public page.</p>}
    <p className="mt-5 text-xs leading-6 text-muted">Admin pages, unavailable content, search filters and hash changes are excluded. Only page totals are stored; no visitor profiles or tracking cookies are created.</p>
  </section>;
}
