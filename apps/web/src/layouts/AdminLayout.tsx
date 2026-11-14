import { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { useAdminSession } from '../features/auth/hooks/useAdminSession';
import { logout } from '../features/auth/services/auth.service';
const items = [['/admin', 'Overview'], ['/admin/blogs', 'Blogs'], ['/admin/events', 'Events'], ['/admin/classes', 'Classes'], ['/admin/media', 'Media'], ['/admin/settings', 'Site settings']] as const;
export function AdminLayout() {
  const { data: user } = useAdminSession();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const client = useQueryClient();
  const navigate = useNavigate();
  async function signOut() {
    setBusy(true); setError('');
    try { await logout(); client.clear(); navigate('/admin/login', { replace: true }); }
    catch { setError('Unable to sign out. Please try again.'); } finally { setBusy(false); }
  }
  return <div className="mx-auto max-w-7xl px-5 py-6 md:px-8">
    <header className="mb-8 rounded-2xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-4"><div><Link to="/admin" className="text-xl font-bold text-ink">Artopus <span className="text-accent">studio</span></Link><p className="mt-1 text-xs text-muted">Welcome, {user?.name}</p></div><div className="flex items-center gap-4"><Link to="/" className="text-sm text-accent underline">View website</Link><ThemeToggle /><button className="text-sm text-muted underline" disabled={busy} onClick={() => void signOut()}>{busy ? 'Signing out…' : 'Sign out'}</button></div></div>
      <nav aria-label="Admin navigation" className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm">{items.filter(([path]) => path !== '/admin/settings' || user?.role === 'admin').map(([path, label]) => <NavLink key={path} to={path} end={path === '/admin'} className={({ isActive }) => isActive ? 'font-semibold text-accent underline' : 'text-muted hover:text-accent hover:underline'}>{label}</NavLink>)}</nav>
      {error && <p role="alert" className="mt-4 text-error">{error}</p>}
    </header><main><Outlet /></main>
  </div>;
}
