'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            retry: (failureCount, error) => {
              // Don't retry on 4xx errors except 408, 429
              if (
                error instanceof Error &&
                'status' in error &&
                typeof error.status === 'number'
              ) {
                if (error.status >= 400 && error.status < 500 && 
                    error.status !== 408 && error.status !== 429) {
                  return false;
                }
              }
              return failureCount < 3;
            },
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: (failureCount, error) => {
              // Don't retry mutations on client errors
              if (
                error instanceof Error &&
                'status' in error &&
                typeof error.status === 'number' &&
                error.status >= 400 && error.status < 500
              ) {
                return false;
              }
              return failureCount < 2;
            },
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}