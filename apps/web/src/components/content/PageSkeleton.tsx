export function PageSkeleton({ title, description, sections }: { title: string; description: string; sections: readonly string[] }) {
  const markers = ['bg-primary', 'bg-art-cyan', 'bg-art-orange', 'bg-art-pink'] as const;
  return <article className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-12">
    <header className="ambient-hero rounded-3xl border border-line px-6 py-10 md:px-10 md:py-14">
      <p className="mb-5 inline-flex rounded-full bg-tint px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-accent">Project skeleton</p>
      <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-ink md:text-5xl">{title}</h1>
      <p className="mt-5 max-w-2xl leading-7 text-muted">{description}</p>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">These labeled placeholders describe planned content. No live offerings or management features are enabled.</p>
    </header>
    <div className="mt-8 grid gap-5 md:grid-cols-2">{sections.map((section, index) =>
      <section key={section} className="min-h-36 rounded-2xl border border-line bg-surface p-6">
        <span aria-hidden="true" className={'mb-5 block h-1 w-8 rounded-full ' + markers[index % markers.length]} />
        <h2 className="text-lg font-semibold text-ink">{section}</h2>
        <p className="mt-3 text-sm text-muted">Content and functionality pending.</p>
      </section>
    )}</div>
  </article>;
}
