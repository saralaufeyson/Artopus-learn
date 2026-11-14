import { useSearchParams } from 'react-router';
export function Pagination({ page, total, limit }: { page: number; total: number; limit: number }) {
  const [params, setParams] = useSearchParams();
  const pages = Math.ceil(total / limit);
  if (pages <= 1) return null;
  const change = (next: number) => { const updated = new URLSearchParams(params); updated.set('page', String(next)); setParams(updated); };
  return <nav aria-label="Pagination" className="mt-10 flex flex-wrap items-center justify-center gap-4"><button className="filter-chip" disabled={page <= 1} onClick={() => change(page - 1)}>Previous</button><span className="text-sm text-muted">Page {page} of {pages}</span><button className="filter-chip" disabled={page >= pages} onClick={() => change(page + 1)}>Next</button></nav>;
}
