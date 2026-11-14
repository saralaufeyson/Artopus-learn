import type { ApiErrorBody, ApiSuccess } from '@artopus/shared';
export class ApiClientError extends Error {
  constructor(public status: number, public code: string, message: string) { super(message); }
}
export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !(init.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  const response = await fetch((import.meta.env.SSR ? (import.meta.env.VITE_PRERENDER_API_URL || 'http://127.0.0.1:4000/api/v1') : (import.meta.env.VITE_API_BASE_URL || '/api/v1')) + path, {
    ...init, headers, credentials: 'include', signal: init.signal ?? AbortSignal.timeout(15000),
  });
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const error = body as ApiErrorBody | null;
    throw new ApiClientError(response.status, error?.error?.code || 'REQUEST_FAILED', error?.error?.message || 'The request failed.');
  }
  if (response.status === 204) return undefined as T;
  return (body as ApiSuccess<T>).data;
}
