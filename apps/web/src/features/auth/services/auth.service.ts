import type { AdminSession } from '@artopus/shared';
import { apiRequest, ApiClientError } from '../../../services/api-client';
export async function getAdminSession(): Promise<AdminSession | null> {
  try { return await apiRequest<AdminSession>('/auth/session'); }
  catch (error) { if (error instanceof ApiClientError && error.status === 401) return null; throw error; }
}
export async function authenticatedRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { token } = await apiRequest<{ token: string }>('/auth/csrf');
  const headers = new Headers(init.headers);
  headers.set('X-CSRF-Token', token);
  return apiRequest<T>(path, { ...init, headers, signal: init.signal ?? AbortSignal.timeout(60_000) });
}
export interface OtpRequest { challengeId: string; expiresIn: number; resendAfter: number; message: string }
export const requestOtp = (email: string) => authenticatedRequest<OtpRequest>('/auth/login', { method: 'POST', body: JSON.stringify({ email }) });
export const verifyOtp = (challengeId: string, code: string) => authenticatedRequest<AdminSession>('/auth/verify', { method: 'POST', body: JSON.stringify({ challengeId, code }) });
export const logout = () => authenticatedRequest<void>('/auth/logout', { method: 'POST' });
