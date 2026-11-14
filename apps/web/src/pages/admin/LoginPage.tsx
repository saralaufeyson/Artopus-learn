import { Link, Navigate } from 'react-router';
import { Mail, ShieldCheck } from 'lucide-react';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { LoginForm } from '../../features/auth/components/LoginForm';
import { useAdminSession } from '../../features/auth/hooks/useAdminSession';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
export function LoginPage() {
  useDocumentTitle('Administrator login');
  const session = useAdminSession();
  if (session.data) return <Navigate to="/admin" replace />;
  return <main className="ambient-hero min-h-screen">
    <div className="mx-auto flex max-w-6xl items-center justify-between gap-5 px-5 pt-5 md:px-8"><Link to="/" className="font-semibold text-accent">ARTOPUS <span className="text-ink">LEARN</span></Link><ThemeToggle /></div>
    <section className="mx-auto w-full max-w-lg px-5 py-16">
      <div className="mb-6 inline-flex rounded-2xl border border-line bg-tint p-4 text-accent"><Mail size={28} aria-hidden="true" /></div>
      <p className="eyebrow">Your creative workspace</p>
      <h1 className="mb-4 text-4xl font-bold tracking-tight">Welcome back.</h1>
      <p className="mb-8 text-muted leading-7">Manage your stories, classes, and creative events. Sign in with a code sent to your approved email.</p>
      <div className="rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-8"><LoginForm /></div>
      <p className="mt-6 flex items-start gap-2 text-xs leading-6 text-muted"><ShieldCheck className="mt-1 shrink-0" size={16} aria-hidden="true" />Administrator access only. Codes are sent from contact@artopusindia.com.</p>
      <Link className="mt-6 inline-block text-sm text-accent underline" to="/">Return to the website</Link>
    </section>
  </main>;
}
