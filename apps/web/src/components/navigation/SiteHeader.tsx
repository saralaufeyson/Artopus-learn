import { NavLink, Link } from 'react-router';
import { Palette } from 'lucide-react';
import { publicPages } from '../../routes/paths';
import { useSiteSettings } from '../../features/settings/hooks/useSiteSettings';
import { ThemeToggle } from '../ui/ThemeToggle';
export function SiteHeader() {
  const { data: settings } = useSiteSettings();
  return <header className="border-b border-line bg-surface">
    <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-4 px-5 py-4 md:px-8">
      <Link to="/" className="flex items-center gap-3 text-xl font-bold tracking-tight text-ink">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-tint text-accent"><Palette size={23} aria-hidden="true" /></span>
        <span>{settings?.branding.name || 'Artopus Learn'}</span>
      </Link>
      <nav aria-label="Main navigation" className="order-3 flex w-full flex-wrap gap-x-5 gap-y-3 text-sm font-medium lg:order-none lg:w-auto">{publicPages.map(({ path, title }) =>
        <NavLink key={path} to={path} end={path === '/'} className={({ isActive }) => isActive ? 'font-semibold text-accent underline decoration-2 underline-offset-8' : 'text-muted hover:text-accent hover:underline'}>{title}</NavLink>
      )}</nav>
      <ThemeToggle />
    </div>
  </header>;
}
