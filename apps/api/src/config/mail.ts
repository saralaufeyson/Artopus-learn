import nodemailer from 'nodemailer';
import type { AppEnv } from './env.js';
import { ApiError } from '../lib/api-error.js';
export const OTP_FROM = 'contact@artopusindia.com';
export interface OtpMailer { sendOtp(to: string, code: string): Promise<void> }
export function createOtpMailer(env: AppEnv): OtpMailer | undefined {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) return undefined;
  const transport = nodemailer.createTransport({
    host: env.SMTP_HOST, port: env.SMTP_PORT, secure: env.SMTP_PORT === 465,
    requireTLS: true, auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    connectionTimeout: 10_000, greetingTimeout: 10_000, socketTimeout: 15_000,
    tls: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
    disableFileAccess: true, disableUrlAccess: true,
  });
  return { async sendOtp(to, code) {
    try {
      const result = await transport.sendMail({
        from: { name: 'Artopus India', address: OTP_FROM }, to,
        subject: 'Your Artopus Learn sign-in code',
        text: 'Your Artopus Learn administrator sign-in code is: ' + code + '\n\nThis code expires in 5 minutes and can be used once. Never share it. If you did not request this code, ignore this email.',
        headers: { 'X-Auto-Response-Suppress': 'All' },
      });
      if (!result.accepted.length) throw new Error('Recipient rejected');
    } catch { throw new ApiError(503, 'MAIL_UNAVAILABLE', 'The sign-in email could not be sent. Please try again later or contact the site owner.'); }
  } };
}
