import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useParams, useNavigate, useBeforeUnload } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../services/api-client';
import { authenticatedRequest } from '../auth/services/auth.service';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { EditorFields } from './EditorFields';
import { editorConfigs, settingsConfig, type ContentKind } from './editor-config';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
type Values = Record<string, unknown>;
function prepare(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(prepare);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).filter(([key]) => !['id', 'createdAt', 'updatedAt', '__v'].includes(key)).map(([key, item]) => [key, ['publishedAt', 'scheduledAt', 'startDate', 'endDate', 'registrationDeadline'].includes(key) && typeof item === 'string' ? new Date(Date.parse(item) - new Date(item).getTimezoneOffset() * 60_000).toISOString().slice(0, 16) : prepare(item)]));
  return value;
}
function clean(value: unknown, key = ''): unknown {
  if (typeof value === 'string' && ['publishedAt', 'scheduledAt', 'startDate', 'endDate', 'registrationDeadline'].includes(key)) return value ? new Date(value).toISOString() : undefined;
  if ((value === '' && !['title', 'description', 'content', 'excerpt', 'location', 'tagline', 'heading', 'label', 'answer', 'question', 'name'].includes(key)) || (typeof value === 'number' && !Number.isFinite(value))) return undefined;
  if (Array.isArray(value)) return value.map(item => clean(item)).filter(item => item !== undefined);
  if (value && typeof value === 'object') {
    const entries = Object.entries(value).map(([key, item]) => [key, clean(item, key)] as const).filter(([, item]) => item !== undefined);
    if (key === 'featuredVideo' && !entries.some(([name, item]) => name === 'url' && item)) return undefined;
    if (key === 'fee') return entries.some(([name]) => name === 'amount') ? { ...Object.fromEntries(entries), currency: 'INR' } : undefined;
    if (key === 'instructor' && !entries.some(([name, item]) => name === 'name' && item)) return undefined;
    if (['primaryCta', 'secondaryCta', 'action'].includes(key) && !entries.some(([name, item]) => name === 'href' && item)) return undefined;
    return entries.length ? Object.fromEntries(entries) : undefined;
  }
  return value;
}
export function ContentEditor({ kind }: { kind: ContentKind | 'settings' }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const client = useQueryClient();
  const settings = kind === 'settings';
  const config = settings ? settingsConfig : editorConfigs[kind];
  const title = settings ? 'Site settings' : (id ? 'Edit ' : 'Create ') + editorConfigs[kind].singular;
  useDocumentTitle(title);
  const path = '/admin/' + kind + (settings || !id ? '' : '/' + id);
  const query = useQuery({ queryKey: ['admin', kind, id || 'settings'], queryFn: () => apiRequest<Values>(path), enabled: settings || !!id });
  const form = useForm<Values>({ defaultValues: settings ? {} : editorConfigs[kind].defaults });
  const { reset } = form;
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [preview, setPreview] = useState<Values>();
  useEffect(() => { if (query.data) reset(prepare(query.data) as Values); }, [query.data, reset]);
  useBeforeUnload(event => { if (form.formState.isDirty) { event.preventDefault(); event.returnValue = ''; } });
  async function submit(values: Values, draft: boolean) {
    setError(''); setNotice(''); form.clearErrors();
    let prepared = clean(values) as Values;
    if (!prepared) prepared = {};
    // Required empty text fields remain editable without inventing content.
    if (kind === 'blogs') { prepared.excerpt ??= ''; prepared.content ??= ''; }
    if (kind === 'events') prepared.location ??= '';
    if (settings) {
      const branding = prepared.branding as Values | undefined; if (branding) branding.tagline ??= '';
      const hero = prepared.heroSection as Values | undefined; if (hero) { hero.heading ??= ''; hero.description ??= ''; }
      const about = prepared.aboutSection as Values | undefined; if (about) { about.heading ??= ''; about.content ??= ''; }
      prepared.registrationLinks ??= {}; prepared.socialLinks ??= {}; prepared.contactDetails ??= {};
    }
    if (draft) prepared.status = 'draft';
    const result = config.schema.safeParse(prepared);
    if (!result.success) {
      result.error.issues.forEach(issue => form.setError(issue.path.join('.'), { type: 'validate', message: issue.message }));
      setError('Please check: ' + result.error.issues.map(issue => issue.path.join(' → ') + ': ' + issue.message).join('; ')); return;
    }
    try {
      const saved = await authenticatedRequest<Values>(path, { method: settings || id ? 'PUT' : 'POST', body: JSON.stringify(result.data) });
      reset(prepare(saved) as Values); setNotice('Saved successfully.'); setPreview(undefined);
      await client.invalidateQueries({ predicate: item => item.queryKey[0] !== 'admin-session' });
      if (!settings && !id) navigate('/admin/' + kind + '/' + String(saved.id) + '/edit', { replace: true });
    } catch (error) { setError(error instanceof Error ? error.message : 'Unable to save. Your edits are still here.'); }
  }
  async function openPreview() {
    setError('');
    try { setPreview(await apiRequest<Values>(path)); } catch { setError('Unable to load the saved preview.'); }
  }
  if ((settings || id) && query.isPending) return <LoadingState message="Opening your content…" />;
  if ((settings || id) && query.isError) return <ErrorState message={query.error.message} retry={() => void query.refetch()} />;
  return <div className="mx-auto max-w-4xl">
    {!settings && <Link className="text-sm text-accent underline" to={'/admin/' + kind}>← All {editorConfigs[kind].title.toLowerCase()}</Link>}
    <div className="mb-7 mt-4"><p className="eyebrow">Make room for creativity</p><h1 className="text-3xl font-bold capitalize">{title}</h1><p className="mt-3 text-sm text-muted">Save your changes before leaving. Dates use your local time zone.</p></div>
    {error && <p role="alert" className="mb-5 rounded-xl border border-error-line bg-error-surface p-4 text-sm text-error">{error}</p>}
    {notice && <p role="status" className="mb-5 rounded-xl border border-line bg-tint p-4 text-sm text-accent">{notice}</p>}
    <form onSubmit={event => { const draft = (event.nativeEvent as SubmitEvent).submitter?.getAttribute('value') === 'draft'; void form.handleSubmit(values => submit(values, draft))(event); }}>
      <EditorFields sections={config.sections} form={form} />
      <div className="sticky bottom-3 mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface p-4 shadow-lg">
        <Button type="submit" value="save" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? 'Saving…' : 'Save changes'}</Button>
        {!settings && <button type="submit" value="draft" disabled={form.formState.isSubmitting} className="action-link action-secondary">Save as draft</button>}
        {!settings && !!id && <button type="button" className="action-link action-secondary" onClick={() => void openPreview()}>Preview saved content</button>}
        <span className="text-xs text-muted">{form.formState.isDirty ? 'Unsaved changes' : 'All changes saved'}</span>
      </div>
    </form>
    {preview && <section className="my-8 rounded-2xl border border-line bg-surface p-6" aria-label="Saved preview"><div className="flex items-center justify-between gap-4"><p className="eyebrow">Private preview · saved version</p><button className="text-sm text-accent underline" onClick={() => setPreview(undefined)}>Close preview</button></div><h2 className="mb-6 text-3xl font-bold">{String(preview.title)}</h2><div className="prose-art" dangerouslySetInnerHTML={{ __html: String(preview.content || preview.description || '') }} />{!!preview.rules && <div className="prose-art" dangerouslySetInnerHTML={{ __html: String(preview.rules) }} />}{!!preview.results && <div className="prose-art" dangerouslySetInnerHTML={{ __html: String(preview.results) }} />}</section>}
  </div>;
}
