import { Image } from 'lucide-react';
export function ImagePlaceholder({ label }: { label: string }) {
  return <div className="flex aspect-video items-center justify-center gap-3 rounded-2xl border border-dashed border-line-strong bg-surface-muted p-6 text-muted"><Image aria-hidden="true" size={24} /><span>Image placeholder: {label}</span></div>;
}
