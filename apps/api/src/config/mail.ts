import type { AppEnv } from './env.js';
import { ApiError } from '../lib/api-error.js';
export const OTP_FROM = 'contact@artopusindia.com';
export interface OtpMailer { sendOtp(to: string, code: string): Promise<void> }
export function createOtpMailer(env: AppEnv): OtpMailer | undefined {
  const apiKey = env.RESEND_API_KEY?.trim();
  if (!apiKey) return undefined;
  return { async sendOtp(to, code) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST', redirect: 'error', signal: AbortSignal.timeout(10_000),
        headers: { Authorization: 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Artopus India <' + OTP_FROM + '>', to: [to],
          subject: 'Your Artopus Learn sign-in code',
          text: 'Your Artopus Learn administrator sign-in code is: ' + code + '\n\nThis code expires in 5 minutes and can be used once. Never share it. If you did not request this code, ignore this email.',
          headers: { 'X-Auto-Response-Suppress': 'All' },
        }),
      });
      if (!response.ok) {
        await response.body?.cancel();
        throw new Error('Email rejected');
      }
      const result: unknown = await response.json();
      if (!result || typeof result !== 'object' || !('id' in result) || typeof result.id !== 'string' || !result.id.trim()) {
        throw new Error('Email not accepted');
      }
    } catch { throw new ApiError(503, 'MAIL_UNAVAILABLE', 'The sign-in email could not be sent. Please try again later or contact the site owner.'); }
  } };
}
