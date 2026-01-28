'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { APIResponse } from '@/lib/types';
import { useAuthStore } from '@/store/authStore';

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
  const { isAuthenticated, user, isLoading } = useAuthStore();

  return useQuery({
    queryKey: ['sync-status'],
    queryFn: fetchSyncStatus,
    // Only enable query when user is authenticated and not loading
    enabled: isAuthenticated && !!user && !isLoading,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    // Only poll when authenticated
    refetchInterval: (data, query) => {
      // Stop polling if user becomes unauthenticated
      if (!isAuthenticated || !user) return false;
      // Exponential backoff on errors
      if (query.state.error) return Math.min(60000 * Math.pow(2, query.state.errorUpdateCount), 300000);
      return 30000; // 30 seconds normal interval
    },
    retry: (failureCount, error: any) => {
      // Stop retrying on 401 (unauthorized)
      if (error?.message?.includes('401') || error?.message?.includes('unauthorized')) return false;
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Max 30 second delay
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