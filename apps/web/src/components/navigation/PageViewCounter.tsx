import { Eye } from 'lucide-react';
import { usePageViewTotal } from '../../features/analytics/page-views';
export function PageViewCounter() {
  const { data, isError } = usePageViewTotal();
  return <span className="inline-flex items-center gap-2" title="Total public page views. Repeat visits count; this is not a count of unique people.">
    <Eye size={15} className="text-accent" aria-hidden="true" />
    <span>Page views: <strong className="font-semibold text-ink">{data ? new Intl.NumberFormat('en-IN').format(data.total) : isError ? 'Unavailable' : '…'}</strong></span>
  </span>;
}
