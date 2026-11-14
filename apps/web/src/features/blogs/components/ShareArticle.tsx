import { useState } from 'react';
import { Share2, Link as LinkIcon } from 'lucide-react';
export function ShareArticle({ title }: { title: string }) {
  const [message, setMessage] = useState('');
  const copy = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setMessage('Link copied.'); }
    catch { setMessage('Copy the page address from your browser to share this story.'); }
  };
  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title, url: window.location.href });
      else await copy();
    } catch (error) { if (!(error instanceof DOMException && error.name === 'AbortError')) setMessage('Sharing is unavailable. You can copy the link instead.'); }
  };
  return <div className="mt-10 border-t border-line pt-6"><div className="flex flex-wrap items-center gap-3"><span className="mr-2 text-sm font-semibold">Pass the inspiration on</span><button className="filter-chip inline-flex items-center gap-2" onClick={() => { void share(); }}><Share2 size={15} aria-hidden="true" />Share</button><button className="filter-chip inline-flex items-center gap-2" onClick={() => { void copy(); }}><LinkIcon size={15} aria-hidden="true" />Copy link</button></div><p role="status" className="mt-3 text-sm text-accent">{message}</p></div>;
}
