import { useState } from 'react';
import { QueryClient, QueryClientProvider, HydrationBoundary, type DehydratedState } from '@tanstack/react-query';
import { AppRoutes } from './routes/AppRoutes';
export function App({ client, initialState }: { client?: QueryClient; initialState?: DehydratedState }) {
  const [queryClient] = useState(() => client ?? new QueryClient({
    defaultOptions: { queries: { retry: 1, staleTime: 60_000 } },
  }));
  return <QueryClientProvider client={queryClient}><HydrationBoundary state={initialState}><AppRoutes /></HydrationBoundary></QueryClientProvider>;
}
