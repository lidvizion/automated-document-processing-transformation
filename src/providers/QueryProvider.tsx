'use client';

import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { logger } from '@/lib/logger';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof Error && error.message.includes('4')) {
          return false;
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: 1,
    },
  },
});

// Add global error handling
queryClient.setMutationDefaults(['processingHistory'], {
  onError: (error) => {
    logger.error('Mutation error', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  },
});

queryClient.setQueryDefaults(['processingHistory'], {
  onError: (error) => {
    logger.error('Query error', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  },
});

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
