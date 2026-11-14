import { useEffect, useState } from 'react';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import { safeHref } from '@artopus/shared';
import { MediaPicker } from '../../media/components/MediaPicker';
export function RichTextEditor({ value, onChange, label }: { value: string; onChange: (value: string) => void; label: string }) {
  const [tool, setTool] = useState<'link' | 'video' | 'image'>();
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const editor = useEditor({
    extensions: [StarterKit.configure({ link: { openOnClick: false, protocols: ['https', 'mailto', 'tel'] } }), Image, Youtube.configure({ nocookie: true })],
    content: value, immediatelyRender: false,
    editorProps: { attributes: { class: 'prose-art min-h-60 px-5 py-4 focus:outline-none', role: 'textbox', 'aria-label': label, 'aria-multiline': 'true' } },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });
  useEffect(() => { if (editor && editor.getHTML() !== value) editor.commands.setContent(value, { emitUpdate: false }); }, [editor, value]);
  useEditorState({ editor, selector: ({ editor }) => editor?.state });
  if (!editor) return <p>Loading editor…</p>;
  function insert() {
    setError('');
    if (tool === 'link') {
      const href = safeHref(url);
      if (!href) { setError('Use a website path or HTTPS link.'); return; }
      editor?.chain().focus().extendMarkRange('link').setLink({ href }).run();
    } else {
      try { const video = new URL(url); if (video.protocol !== 'https:' || !['www.youtube.com', 'youtube.com', 'youtu.be'].includes(video.hostname)) throw new Error(); }
      catch { setError('Use an HTTPS YouTube video link.'); return; }
      editor?.commands.setYoutubeVideo({ src: url });
    }
    setTool(undefined); setUrl('');
  }
  return <div className="overflow-hidden rounded-xl border border-line-strong bg-surface">
    <div className="flex flex-wrap gap-2 border-b border-line bg-surface-muted p-3" role="toolbar" aria-label={label + ' formatting'}>
      {([
        ['Bold', () => editor.chain().focus().toggleBold().run(), editor.isActive('bold')],
        ['Italic', () => editor.chain().focus().toggleItalic().run(), editor.isActive('italic')],
        ['Heading', () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive('heading')],
        ['Bullets', () => editor.chain().focus().toggleBulletList().run(), editor.isActive('bulletList')],
        ['Numbers', () => editor.chain().focus().toggleOrderedList().run(), editor.isActive('orderedList')],
        ['Quote', () => editor.chain().focus().toggleBlockquote().run(), editor.isActive('blockquote')],
        ['Undo', () => editor.chain().focus().undo().run(), false],
        ['Redo', () => editor.chain().focus().redo().run(), false],
      ] as const).map(([name, run, active]) => <button type="button" key={name} onClick={run} aria-pressed={active} className={'rounded-lg border border-line px-3 py-2 text-xs ' + (active ? 'bg-primary text-white' : 'bg-surface text-ink')}>{name}</button>)}
      {(['link', 'video', 'image'] as const).map(name => <button key={name} type="button" className="rounded-lg border border-line bg-surface px-3 py-2 text-xs capitalize" onClick={() => { setTool(tool === name ? undefined : name); setError(''); }}>{name}</button>)}
      {editor.isActive('link') && <button type="button" className="px-3 text-xs text-accent" onClick={() => editor.chain().focus().unsetLink().run()}>Remove link</button>}
    </div>
    {tool === 'image' && <div className="p-4"><MediaPicker value="" onChange={(_id, asset) => { if (asset) editor.chain().focus().setImage({ src: asset.url, alt: asset.altText }).run(); setTool(undefined); }} /></div>}
    {(tool === 'link' || tool === 'video') && <div className="border-b border-line p-4">
      <label className="grid gap-2 text-sm">{tool === 'link' ? 'Link address' : 'YouTube video address'}<input className="field-control w-full" value={url} onChange={event => setUrl(event.target.value)} /></label>
      <button type="button" className="mt-3 text-sm text-accent underline" onClick={insert}>Insert {tool}</button>
      {error && <p role="alert" className="mt-2 text-sm text-error">{error}</p>}
    </div>}
    <EditorContent editor={editor} />
  </div>;
}
