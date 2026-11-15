import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createOtpMailer } from './mail.js';
import type { AppEnv } from './env.js';
const env: AppEnv = {
  NODE_ENV: 'test', PORT: 4000, MONGODB_URI: 'mongodb://127.0.0.1:27017/mail_test',
  WEB_ORIGIN: 'http://localhost:5173', SESSION_SECRET: 'test-only-session-secret-at-least-32-characters',
  TRUST_PROXY_HOPS: 0, RESEND_API_KEY: 're_unit_test_key',
};
const code = '654321';
const unavailable = {
  status: 503, code: 'MAIL_UNAVAILABLE',
  message: 'The sign-in email could not be sent. Please try again later or contact the site owner.',
};
const fetchMock = vi.fn<typeof fetch>();
beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
  vi.spyOn(console, 'log').mockImplementation(() => undefined);
  vi.spyOn(console, 'info').mockImplementation(() => undefined);
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});
afterEach(() => {
  try {
    expect(console.log).not.toHaveBeenCalled();
    expect(console.info).not.toHaveBeenCalled();
    expect(console.warn).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  } finally { vi.unstubAllGlobals(); vi.restoreAllMocks(); }
});
describe('Resend OTP delivery', () => {
  it('sends the existing one-use, five-minute email from the fixed sender over HTTPS', async () => {
    fetchMock.mockResolvedValue(Response.json({ id: 'accepted-email-id' }));
    const timeout = vi.spyOn(AbortSignal, 'timeout');
    await expect(createOtpMailer(env)!.sendOtp('admin@example.com', code)).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe('https://api.resend.com/emails');
    expect(init).toMatchObject({
      method: 'POST', redirect: 'error',
      headers: { Authorization: 'Bearer re_unit_test_key', 'Content-Type': 'application/json' },
    });
    expect(timeout).toHaveBeenCalledWith(10_000);
    expect(init!.signal).toBeInstanceOf(AbortSignal);
    expect(JSON.parse(init!.body as string)).toEqual({
      from: 'Artopus India <contact@artopusindia.com>', to: ['admin@example.com'],
      subject: 'Your Artopus Learn sign-in code',
      text: 'Your Artopus Learn administrator sign-in code is: ' + code + '\n\nThis code expires in 5 minutes and can be used once. Never share it. If you did not request this code, ignore this email.',
      headers: { 'X-Auto-Response-Suppress': 'All' },
    });
  });
  it.each([400, 401, 403, 429, 500, 503])('hides provider error details for HTTP %s without retrying', async status => {
    fetchMock.mockResolvedValue(Response.json({ name: 'provider_error', message: 'Sensitive ' + env.RESEND_API_KEY + ' ' + code }, { status }));
    const failure = await createOtpMailer(env)!.sendOtp('admin@example.com', code).catch((error: unknown) => error);
    expect(failure).toMatchObject(unavailable);
    expect(failure).toHaveProperty('details', undefined);
    expect(failure).not.toHaveProperty('cause');
    expect(String(failure)).not.toContain(code);
    expect(String(failure)).not.toContain(env.RESEND_API_KEY);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it.each(['network', 'timeout'])('returns the same safe error for a %s failure', async kind => {
    fetchMock.mockRejectedValue(kind === 'timeout'
      ? new DOMException('Sensitive ' + env.RESEND_API_KEY + ' ' + code, 'TimeoutError')
      : new Error('Sensitive ' + env.RESEND_API_KEY + ' ' + code));
    const failure = await createOtpMailer(env)!.sendOtp('admin@example.com', code).catch((error: unknown) => error);
    expect(failure).toMatchObject(unavailable);
    expect(String(failure)).not.toContain(code);
    expect(String(failure)).not.toContain(env.RESEND_API_KEY);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it.each([null, {}, { id: '' }, { id: 42 }, { error: { message: 'Provider rejected the request' } }])('rejects an invalid success response %j', async body => {
    fetchMock.mockResolvedValue(Response.json(body));
    await expect(createOtpMailer(env)!.sendOtp('admin@example.com', code)).rejects.toMatchObject(unavailable);
  });
  it('handles a malformed provider response with the generic error', async () => {
    fetchMock.mockResolvedValue(new Response('not JSON', { status: 200 }));
    await expect(createOtpMailer(env)!.sendOtp('admin@example.com', code)).rejects.toMatchObject(unavailable);
  });
  it.each([undefined, '', '   '])('fails closed without a usable API key (%j)', apiKey => {
    expect(createOtpMailer({ ...env, RESEND_API_KEY: apiKey })).toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
