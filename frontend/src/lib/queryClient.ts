import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,   // 2 minutes
      gcTime: 5 * 60 * 1000,      // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
