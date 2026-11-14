import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { loginSchema, type LoginInput } from '@artopus/shared';
import { Button } from '../../../components/ui/Button';
import { requestOtp, verifyOtp, type OtpRequest } from '../services/auth.service';
export function LoginForm() {
  const form = useForm<LoginInput>({ resolver: zodResolver(loginSchema), defaultValues: { email: '' } });
  const [challenge, setChallenge] = useState<OtpRequest>();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const client = useQueryClient();
  const navigate = useNavigate();
  useEffect(() => {
    if (!seconds) return;
    const timer = window.setTimeout(() => setSeconds(value => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [seconds]);
  async function send(address: string) {
    setBusy(true); setError('');
    try { const result = await requestOtp(address); setEmail(address); setChallenge(result); setSeconds(result.resendAfter); setCode(''); }
    catch (error) { setError(error instanceof Error ? error.message : 'Unable to request a code. Please try again.'); }
    finally { setBusy(false); }
  }
  async function verify() {
    if (!challenge) return;
    setBusy(true); setError('');
    try {
      const user = await verifyOtp(challenge.challengeId, code);
      client.setQueryData(['admin-session'], user); navigate('/admin', { replace: true });
    } catch (error) { setError(error instanceof Error ? error.message : 'Unable to verify this code.'); }
    finally { setBusy(false); }
  }
  return <div>
    {error && <p role="alert" className="mb-5 rounded-xl border border-error-line bg-error-surface p-4 text-sm text-error">{error}</p>}
    {!challenge ? <form onSubmit={form.handleSubmit(values => send(values.email))} className="grid gap-5">
      <label className="grid gap-2 text-sm font-semibold">Administrator email
        <input className="field-control w-full" type="email" autoComplete="email" required maxLength={254} {...form.register('email')} aria-invalid={!!form.formState.errors.email} />
        {form.formState.errors.email && <span className="text-error">{form.formState.errors.email.message}</span>}
      </label>
      <Button type="submit" disabled={busy}>{busy ? 'Sending code…' : 'Send sign-in code'}</Button>
    </form> : <form onSubmit={event => { event.preventDefault(); void verify(); }} className="grid gap-5">
      <p className="text-sm leading-7 text-muted" role="status">{challenge.message} Check <strong className="break-all text-ink">{email}</strong>, including the spam folder.</p>
      <label className="grid gap-2 text-sm font-semibold">Six-digit code
        <input className="field-control w-full text-center text-2xl tracking-[.4em]" autoFocus inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" required maxLength={6} value={code} onChange={event => setCode(event.target.value.replace(/[^0-9]/g, ''))} />
      </label>
      <p className="text-xs text-muted">Expires after five minutes. Five attempts per code.</p>
      <Button type="submit" disabled={busy || code.length !== 6}>{busy ? 'Verifying…' : 'Verify and sign in'}</Button>
      <div className="flex flex-wrap justify-between gap-4 text-sm">
        <button type="button" className="text-accent underline disabled:text-muted" disabled={busy || seconds > 0} onClick={() => void send(email)}>{seconds > 0 ? 'Resend in ' + seconds + 's' : 'Resend code'}</button>
        <button type="button" className="text-accent underline" disabled={busy} onClick={() => { setChallenge(undefined); setError(''); }}>Use another email</button>
      </div>
    </form>}
  </div>;
}
