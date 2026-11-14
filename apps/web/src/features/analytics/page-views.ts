import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { pageViewInputSchema, type PageViewTotal } from '@artopus/shared';
import { apiRequest } from '../../services/api-client';
const queryKey = ['analytics', 'page-views'] as const;
export function usePageViewTotal() {
  return useQuery({
    queryKey, queryFn: ({ signal }) => apiRequest<PageViewTotal>('/analytics/page-views', { signal }),
    enabled: !import.meta.env.SSR, staleTime: 60_000, refetchInterval: 60_000,
  });
}
export function useTrackPageView() {
  const { pathname } = useLocation();
  const queryClient = useQueryClient();
  const path = pathname.replace(/\/+$/, '') || '/';
  useEffect(() => {
    if (!pageViewInputSchema.safeParse({ path }).success) return;
    // Deferring until after mount lets StrictMode cleanup cancel its first effect.
    // Only pathname changes count: filters, fragments, theme switches and re-renders do not.
    const timer = window.setTimeout(() => {
      void apiRequest<PageViewTotal>('/analytics/page-views', {
        method: 'POST', body: JSON.stringify({ path }),
      }).then(async data => {
        await queryClient.cancelQueries({ queryKey });
        queryClient.setQueryData<PageViewTotal>(queryKey, current => ({ total: Math.max(current?.total ?? 0, data.total) }));
      }).catch(() => { /* Analytics must never interrupt browsing; writes are not retried. */ });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [path, queryClient]);
}
