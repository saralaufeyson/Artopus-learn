import { useState } from 'react';
import { Controller, type UseFormReturn } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import type { PaginatedResult } from '@artopus/shared';
import { apiRequest } from '../../services/api-client';
import { MediaPicker } from '../media/components/MediaPicker';
import { RichTextEditor } from '../blogs/components/RichTextEditor';
import type { FieldSpec, SectionSpec } from './editor-config';
type Values = Record<string, unknown>;
function RepeatedItems({ value, onChange, kind }: { value: unknown; onChange: (value: unknown) => void; kind: 'faqs' | 'benefits' }) {
  const items = (Array.isArray(value) ? value : []) as Record<string, string>[];
  const keys = kind === 'faqs' ? ['question', 'answer'] : ['title', 'description'];
  return <div className="grid gap-4">{items.map((item, index) => <div key={index} className="grid gap-3 rounded-xl border border-line p-4">{keys.map(key => <label key={key} className="grid gap-2 text-sm capitalize">{key.charAt(0).toUpperCase() + key.slice(1)}<textarea className="field-control w-full" value={item[key] || ''} onChange={event => onChange(items.map((entry, i) => i === index ? { ...entry, [key]: event.target.value } : entry))} /></label>)}<button type="button" className="justify-self-start text-sm text-error underline" onClick={() => onChange(items.filter((_, i) => i !== index))}>Remove item {index + 1}</button></div>)}<button type="button" className="justify-self-start text-sm text-accent underline" onClick={() => onChange([...items, Object.fromEntries(keys.map(key => [key, '']))])}>Add {kind === 'faqs' ? 'question' : 'benefit'}</button></div>;
}
function ContentReferences({ value, onChange, kind }: { value: unknown; onChange: (value: unknown) => void; kind: 'classes' | 'events' }) {
  const [page, setPage] = useState(1);
  const query = useQuery({ queryKey: ['admin', kind, 'selection', page], queryFn: () => apiRequest<PaginatedResult<{ id: string; title: string; status: string }>>('/admin/' + kind + '?limit=12&page=' + page) });
  const selected = Array.isArray(value) ? value as string[] : [];
  return <div className="grid gap-2 rounded-xl border border-line p-4">
    {query.isPending && <p>Loading…</p>}{query.isError && <button type="button" onClick={() => void query.refetch()}>Try loading again</button>}
    {query.data?.items.map(item => <label key={item.id} className="flex gap-3 text-sm"><input type="checkbox" checked={selected.includes(item.id)} onChange={event => onChange(event.target.checked ? [...selected, item.id] : selected.filter(id => id !== item.id))} />{item.title} <span className="text-muted">({item.status})</span></label>)}
    {query.data && query.data.total > 12 && <div className="mt-2 flex gap-5 text-sm"><button type="button" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button><span>{page}</span><button type="button" disabled={page * 12 >= query.data.total} onClick={() => setPage(page + 1)}>Next</button></div>}
    <p className="text-xs text-muted">Only active classes and published events appear on the website.</p>
  </div>;
}
function Field({ spec, form }: { spec: FieldSpec; form: UseFormReturn<Values> }) {
  const id = 'field-' + spec.name.replaceAll('.', '-');
  const error = form.getFieldState(spec.name, form.formState).error?.message;
  let input;
  if (spec.type === 'rich') input = <Controller control={form.control} name={spec.name} render={({ field }) => <RichTextEditor value={String(field.value ?? '')} onChange={field.onChange} label={spec.label} />} />;
  else if (spec.type === 'media' || spec.type === 'gallery') input = <Controller control={form.control} name={spec.name} render={({ field }) => <MediaPicker multiple={spec.type === 'gallery'} value={(field.value as string | string[]) || (spec.type === 'gallery' ? [] : '')} onChange={field.onChange} />} />;
  else if (spec.type === 'faqs' || spec.type === 'benefits') input = <Controller control={form.control} name={spec.name} render={({ field }) => <RepeatedItems value={field.value} onChange={field.onChange} kind={spec.type as 'faqs' | 'benefits'} />} />;
  else if (spec.type === 'classRefs' || spec.type === 'eventRefs') input = <Controller control={form.control} name={spec.name} render={({ field }) => <ContentReferences value={field.value} onChange={field.onChange} kind={spec.type === 'classRefs' ? 'classes' : 'events'} />} />;
  else if (spec.type === 'lines') input = <Controller control={form.control} name={spec.name} render={({ field }) => <textarea id={id} className="field-control min-h-28 w-full" value={Array.isArray(field.value) ? field.value.join('\n') : ''} onChange={event => field.onChange(event.target.value.split('\n'))} />} />;
  else if (spec.type === 'select') input = <select id={id} className="field-control w-full capitalize" {...form.register(spec.name)}>{spec.options?.map(option => <option key={option} value={option}>{option}</option>)}</select>;
  else if (spec.type === 'check') input = <input id={id} type="checkbox" className="h-5 w-5 accent-primary" {...form.register(spec.name)} />;
  else if (spec.type === 'textarea') input = <textarea id={id} className="field-control min-h-24 w-full" {...form.register(spec.name)} aria-invalid={!!error} />;
  else input = <input id={id} type={spec.type || 'text'} className="field-control w-full" {...form.register(spec.name, spec.type === 'number' ? { valueAsNumber: true } : {})} aria-invalid={!!error} min={spec.type === 'number' ? 0 : undefined} step={spec.type === 'number' ? 'any' : undefined} />;
  return <div className={'grid gap-2 ' + (spec.type === 'check' ? 'grid-cols-[auto_1fr] items-center' : '')}>
    <label htmlFor={id} className={'text-sm font-semibold ' + (spec.type === 'check' ? 'order-2' : '')}>{spec.label}</label>{input}
    {spec.name === 'slug' && <button type="button" className="justify-self-start text-xs text-accent underline" onClick={() => form.setValue('slug', String(form.getValues('title') || '').normalize('NFKD').toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/[\s-]+/g, '-').slice(0, 160).replace(/-$/, ''), { shouldDirty: true })}>Generate from title</button>}
    {spec.hint && <p className="text-xs leading-6 text-muted">{spec.hint}</p>}
    {error && <p role="alert" className="text-sm text-error">{String(error)}</p>}
  </div>;
}
export function EditorFields({ sections, form }: { sections: SectionSpec[]; form: UseFormReturn<Values> }) {
  return <div className="grid gap-6">{sections.map(section => <section key={section.title} className="rounded-2xl border border-line bg-surface p-5 md:p-7"><h2 className="mb-6 text-xl font-semibold">{section.title}</h2><div className="grid gap-6">{section.fields.map(spec => <Field key={spec.name} spec={spec} form={form} />)}</div></section>)}</div>;
}
