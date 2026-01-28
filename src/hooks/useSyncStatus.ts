'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { APIResponse } from '@/lib/types';

export interface SyncStatus {
  status: 'synced' | 'syncing' | 'error' | 'never_synced';
  lastSyncTime?: Date;
  nextSyncTime?: Date;
  syncProgress?: number; // 0-100
  error?: string;
  transactionsProcessed?: number;
  transactionsTotal?: number;
}

async function fetchSyncStatus(): Promise<SyncStatus> {
  const response = await fetch('/api/sync/status');
  
  if (!response.ok) {
    throw new Error(`Failed to fetch sync status: ${response.statusText}`);
  }

  const apiResponse: APIResponse<SyncStatus> = await response.json();
  
  if (!apiResponse.success) {
    throw new Error('API request failed');
  }

  return apiResponse.data;
}

export function useSyncStatus() {
  return useQuery({
    queryKey: ['sync-status'],
    queryFn: fetchSyncStatus,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30000, // 30 seconds
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

// Hook for triggering manual sync
export function useTriggerSync() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/sync/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to trigger sync: ${response.statusText}`);
      }

      const apiResponse: APIResponse<{ triggered: boolean }> = await response.json();
      
      if (!apiResponse.success) {
        throw new Error('Failed to trigger sync');
      }

      return apiResponse.data;
    },
    onSuccess: () => {
      // Immediately refetch sync status
      queryClient.invalidateQueries({ queryKey: ['sync-status'] });
      
      // Also invalidate transaction and analytics data as they may be updated
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
    onError: (error) => {
      console.error('Failed to trigger sync:', error);
    },
  });
}