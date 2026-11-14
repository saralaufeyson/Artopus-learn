import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { MediaAsset, PaginatedResult } from '@artopus/shared';
import { apiRequest } from '../../../services/api-client';
export function MediaPicker({ value, onChange, multiple = false }: { value: string | string[]; onChange: (value: string | string[], asset?: MediaAsset) => void; multiple?: boolean }) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const query = useQuery({ queryKey: ['admin-media', page], queryFn: () => apiRequest<PaginatedResult<MediaAsset>>('/admin/media?limit=12&page=' + page), enabled: open });
  const selected = Array.isArray(value) ? value : value ? [value] : [];
  return <div className="rounded-xl border border-line p-3">
    <div className="flex flex-wrap items-center gap-4"><button type="button" className="text-sm font-semibold text-accent underline" onClick={() => setOpen(!open)}>{open ? 'Close image selection' : 'Choose from media library'}</button><span className="text-xs text-muted">{selected.length} selected</span>{!!selected.length && <button type="button" className="text-xs text-error underline" onClick={() => onChange(multiple ? [] : '')}>Clear selection</button>}</div>
    {open && <div className="mt-4">
      {query.isPending && <p role="status">Loading images…</p>}
      {query.isError && <button type="button" className="text-error underline" onClick={() => void query.refetch()}>Unable to load. Try again.</button>}
      {query.data?.total === 0 && <p className="text-sm text-muted">Upload an image in the Media tab first.</p>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{query.data?.items.map(asset => <button type="button" aria-pressed={selected.includes(asset.id)} className={'overflow-hidden rounded-xl border-2 text-left ' + (selected.includes(asset.id) ? 'border-accent' : 'border-line')} key={asset.id} onClick={() => { onChange(multiple ? selected.includes(asset.id) ? selected.filter(id => id !== asset.id) : [...selected, asset.id] : asset.id, asset); if (!multiple) setOpen(false); }}><img src={asset.url} alt={asset.altText} className="aspect-video w-full object-cover" /><span className="block p-2 text-xs">{asset.altText}</span></button>)}</div>
      {query.data && query.data.total > 12 && <div className="mt-3 flex gap-5 text-sm"><button type="button" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button><span>{page}</span><button type="button" disabled={page * 12 >= query.data.total} onClick={() => setPage(page + 1)}>Next</button></div>}
    </div>}
  </div>;
}
