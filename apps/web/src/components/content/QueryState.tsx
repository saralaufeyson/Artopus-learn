import type { ReactNode } from 'react';
import { ApiClientError } from '../../services/api-client';
import { ErrorState } from '../ui/ErrorState';
import { LoadingState } from '../ui/LoadingState';
import { Link } from 'react-router';
export function QueryState({ pending, error, retry, children }: { pending: boolean; error: Error | null; retry: () => void; children: ReactNode }) {
  if (pending) return <div className="container-art py-16"><LoadingState message="Opening the studio..." /></div>;
  if (error instanceof ApiClientError && error.status === 404) return <div className="container-art py-20"><h1 className="page-title">This page is not available.</h1><p className="mt-4 text-muted">It may have moved or is not published yet.</p><Link to="/" className="action-link action-primary mt-7">Return home</Link></div>;
  if (error) return <div className="container-art py-16"><ErrorState message="We couldn't load this content. Please try again in a moment." retry={retry} /></div>;
  return children;
}
