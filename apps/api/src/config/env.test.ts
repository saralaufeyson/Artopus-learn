import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadEnv } from './env.js';
beforeEach(() => {
  vi.stubEnv('NODE_ENV', 'test');
  vi.stubEnv('PORT', '4000');
  vi.stubEnv('MONGODB_URI', 'mongodb://127.0.0.1:27017/env_test');
  vi.stubEnv('WEB_ORIGIN', 'http://localhost:5173');
  vi.stubEnv('SESSION_SECRET', 'test-only-session-secret-at-least-32-characters');
  vi.stubEnv('RESEND_API_KEY', undefined);
  vi.stubEnv('TRUST_PROXY_HOPS', '0');
});
afterEach(() => { vi.unstubAllEnvs(); });
describe('OTP email configuration', () => {
  it.each([undefined, '', '   '])('requires a usable RESEND_API_KEY in production (%j)', apiKey => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('RESEND_API_KEY', apiKey);
    expect(() => loadEnv()).toThrow('RESEND_API_KEY is required in production');
  });
  it('accepts and trims the production Resend key', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('RESEND_API_KEY', '  re_unit_test_key  ');
    expect(loadEnv().RESEND_API_KEY).toBe('re_unit_test_key');
  });
  it.each(['development', 'test'])('allows %s startup without email configuration', nodeEnv => {
    vi.stubEnv('NODE_ENV', nodeEnv);
    expect(loadEnv().RESEND_API_KEY).toBeUndefined();
  });
  it('does not use legacy SMTP settings as a production email configuration', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('SMTP_HOST', 'smtp.example.com');
    vi.stubEnv('SMTP_PORT', '25');
    vi.stubEnv('SMTP_USER', 'unit-test');
    vi.stubEnv('SMTP_PASS', 'unit-test');
    expect(() => loadEnv()).toThrow('RESEND_API_KEY is required in production');
    vi.stubEnv('RESEND_API_KEY', 're_unit_test_key');
    expect(loadEnv()).not.toHaveProperty('SMTP_PORT');
  });
});
