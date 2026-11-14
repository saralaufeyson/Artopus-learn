export function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="rounded-2xl border border-line p-6"><h2 className="text-xl font-semibold">{title}</h2><p className="mt-2 text-muted">{description}</p></div>;
}
