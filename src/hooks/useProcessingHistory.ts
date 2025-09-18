// React Query hook for processing history management
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { logger } from '@/lib/logger';

export interface ProcessingHistory {
  id: string;
  timestamp: Date;
  filesCount: number;
  status: 'completed' | 'failed' | 'cancelled';
  duration: number;
  userId?: string;
  workspaceId?: string;
}

export interface ProcessingHistoryCreate {
  filesCount: number;
  status: 'completed' | 'failed' | 'cancelled';
  duration: number;
  userId?: string;
  workspaceId?: string;
}

// Mock API functions - replace with actual API calls
const mockApi = {
  getHistory: async (userId?: string): Promise<ProcessingHistory[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock data from localStorage or default
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('processingHistory');
      if (stored) {
        return JSON.parse(stored).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
      }
    }
    
    return [
      {
        id: '1',
        timestamp: new Date(Date.now() - 86400000), // 1 day ago
        filesCount: 3,
        status: 'completed',
        duration: 45000,
        userId,
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 172800000), // 2 days ago
        filesCount: 1,
        status: 'completed',
        duration: 23000,
        userId,
      },
    ];
  },

  createHistory: async (data: ProcessingHistoryCreate): Promise<ProcessingHistory> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newHistory: ProcessingHistory = {
      id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...data,
    };

    // Store in localStorage (replace with actual API call)
    if (typeof window !== 'undefined') {
      const existing = JSON.parse(localStorage.getItem('processingHistory') || '[]');
      existing.unshift(newHistory);
      // Keep only last 50 entries
      if (existing.length > 50) {
        existing.splice(50);
      }
      localStorage.setItem('processingHistory', JSON.stringify(existing));
    }

    logger.info('Processing history created', { 
      historyId: newHistory.id, 
      filesCount: data.filesCount,
      status: data.status 
    });

    return newHistory;
  },
};

export function useProcessingHistory(userId?: string) {
  const queryClient = useQueryClient();

  const {
    data: history = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['processingHistory', userId],
    queryFn: () => mockApi.getHistory(userId),
    enabled: Boolean(userId),
    staleTime: 60_000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  const createHistoryMutation = useMutation({
    mutationFn: mockApi.createHistory,
    onSuccess: (newHistory) => {
      // Update the cache with the new history entry
      queryClient.setQueryData(['processingHistory', userId], (oldData: ProcessingHistory[] = []) => {
        return [newHistory, ...oldData];
      });
      
      logger.info('Processing history updated in cache', { 
        historyId: newHistory.id 
      });
    },
    onError: (error) => {
      logger.error('Failed to create processing history', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    },
  });

  const addHistoryEntry = (data: ProcessingHistoryCreate) => {
    return createHistoryMutation.mutateAsync(data);
  };

  return {
    history,
    isLoading,
    error,
    refetch,
    addHistoryEntry,
    isCreating: createHistoryMutation.isPending,
    createError: createHistoryMutation.error,
  };
}
