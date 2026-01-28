'use client';

import { useQuery } from '@tanstack/react-query';
import { DashboardMetrics, APIResponse } from '@/lib/types';

async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const response = await fetch('/api/analytics/overview');
  
  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard metrics: ${response.statusText}`);
  }

  const apiResponse: APIResponse<DashboardMetrics> = await response.json();
  
  if (!apiResponse.success) {
    throw new Error('API request failed');
  }

  return apiResponse.data;
}

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: fetchDashboardMetrics,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}