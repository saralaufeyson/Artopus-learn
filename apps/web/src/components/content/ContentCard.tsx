import type { ReactNode } from 'react';
import { Link } from 'react-router';
export function ContentCard({ title, href, children }: { title: string; href: string; children: ReactNode }) {
  return <article className="rounded-2xl border border-line bg-surface p-6"><h2 className="text-xl font-semibold"><Link to={href} className="underline">{title}</Link></h2><div className="mt-3 text-muted">{children}</div></article>;
}
