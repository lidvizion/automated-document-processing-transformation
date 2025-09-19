'use client';

import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// Simple console logger for deployment compatibility
const logger = {
  info: (msg: string, context?: Record<string, unknown>) => console.log(`[INFO] ${msg}`, context || ''),
  error: (msg: string, context?: Record<string, unknown>) => console.error(`[ERROR] ${msg}`, context || ''),
  warn: (msg: string, context?: Record<string, unknown>) => console.warn(`[WARN] ${msg}`, context || ''),
  debug: (msg: string, context?: Record<string, unknown>) => console.debug(`[DEBUG] ${msg}`, context || ''),
};

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
  retry: (failureCount, error) => {
    logger.error('Mutation error', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      failureCount
    });
    return failureCount < 2; // Retry once
  },
});

// Global query error handling is now done through the default options above

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
