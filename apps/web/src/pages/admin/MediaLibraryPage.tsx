import { useState, type FormEvent } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { MediaAsset, PaginatedResult } from '@artopus/shared';
import { apiRequest } from '../../services/api-client';
import { authenticatedRequest } from '../../features/auth/services/auth.service';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Button } from '../../components/ui/Button';
function AssetCard({ asset, refresh }: { asset: MediaAsset; refresh: () => Promise<void> }) {
  const [confirm, setConfirm] = useState(false); const [busy, setBusy] = useState(false); const [message, setMessage] = useState(''); const [error, setError] = useState('');
  async function update(remove: boolean, altText?: string) {
    setBusy(true); setError(''); setMessage('');
    try { await authenticatedRequest('/admin/media/' + asset.id, { method: remove ? 'DELETE' : 'PATCH', ...(remove ? {} : { body: JSON.stringify({ altText }) }) }); if (!remove) setMessage('Alternative text saved.'); await refresh(); }
    catch (error) { setError(error instanceof Error ? error.message : 'Unable to save this image.'); } finally { setBusy(false); }
  }
  return <article className="overflow-hidden rounded-2xl border border-line bg-surface"><img className="aspect-video w-full object-contain bg-surface-muted" src={asset.url} alt={asset.altText} loading="lazy" /><form className="grid gap-3 p-5" onSubmit={event => { event.preventDefault(); void update(false, String(new FormData(event.currentTarget).get('altText') || '')); }}><label className="grid gap-2 text-sm font-semibold">Alternative text<textarea className="field-control w-full" name="altText" defaultValue={asset.altText} maxLength={300} required /></label><p className="text-xs text-muted">{Math.ceil(asset.fileSize / 1024)} KB · {new Date(asset.createdAt).toLocaleDateString()}</p><div className="flex flex-wrap gap-5 text-sm"><button type="submit" disabled={busy} className="text-accent underline">Save text</button><a href={asset.url} target="_blank" rel="noopener noreferrer" className="text-accent underline">Open image</a><button type="button" disabled={busy} className="text-muted underline" onClick={() => setConfirm(!confirm)}>Remove</button></div>{confirm && <div className="rounded-lg bg-error-surface p-3 text-sm"><p>Remove from the library? Images used by content are protected. Hosted files are retained to preserve existing pages.</p><div className="mt-3 flex gap-5"><button type="button" disabled={busy} className="text-error underline" onClick={() => void update(true)}>Confirm removal</button><button type="button" className="underline" onClick={() => setConfirm(false)}>Cancel</button></div></div>}{message && <p role="status" className="text-sm text-accent">{message}</p>}{error && <p role="alert" className="text-sm text-error">{error}</p>}</form></article>;
}
export function MediaLibraryPage() {
  useDocumentTitle('Media library'); const client = useQueryClient(); const [page, setPage] = useState(1); const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [notice, setNotice] = useState('');
  const query = useQuery({ queryKey: ['admin-media', page], queryFn: () => apiRequest<PaginatedResult<MediaAsset>>('/admin/media?limit=12&page=' + page) });
  const refresh = async () => { await client.invalidateQueries({ predicate: query => query.queryKey[0] === 'admin-media' || query.queryKey[0] === 'admin' }); };
  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget; const data = new FormData(form);
    setBusy(true); setError(''); setNotice('');
    try { await authenticatedRequest('/admin/media', { method: 'POST', body: data }); form.reset(); setNotice('Image uploaded and optimized. It is ready to use in your content.'); setPage(1); await refresh(); }
    catch (error) { setError(error instanceof Error ? error.message : 'Unable to upload. Please try again.'); } finally { setBusy(false); }
  }
  return <div><p className="eyebrow">Colour your stories</p><h1 className="text-3xl font-bold">Media library</h1><p className="mt-3 text-muted">Upload once, reuse across your website. Describe each image for visitors using screen readers.</p>
    <form onSubmit={event => void upload(event)} className="my-7 grid gap-5 rounded-2xl border border-line bg-surface p-6 md:grid-cols-2"><label className="grid gap-2 text-sm font-semibold">Image<input className="field-control w-full min-w-0" type="file" name="image" accept="image/jpeg,image/png,image/webp" required /><span className="text-xs font-normal text-muted">JPEG, PNG or WebP, up to 10 MB. Resized and converted to WebP.</span></label><label className="grid gap-2 text-sm font-semibold">Alternative text<input className="field-control w-full" name="altText" maxLength={300} required placeholder="Describe what is shown in this image" /></label><Button className="justify-self-start" type="submit" disabled={busy}>{busy ? 'Uploading…' : 'Upload image'}</Button></form>
    {error && <p role="alert" className="mb-5 text-error">{error}</p>}{notice && <p role="status" className="mb-5 text-accent">{notice}</p>}
    {query.isPending && <p role="status">Loading images…</p>}{query.isError && <button className="text-error underline" onClick={() => void query.refetch()}>Unable to load images. Try again.</button>}
    {query.data?.total === 0 && <p className="rounded-2xl border border-line p-8 text-muted">Your media library is empty. Add an image above to get started.</p>}
    <div className="card-grid">{query.data?.items.map(asset => <AssetCard key={asset.id} asset={asset} refresh={refresh} />)}</div>
    {query.data && <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-sm"><span>{query.data.total} images · Page {page}</span><div className="flex gap-3"><button className="filter-chip" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button><button className="filter-chip" disabled={page * 12 >= query.data.total} onClick={() => setPage(page + 1)}>Next</button></div></div>}
  </div>;
}
