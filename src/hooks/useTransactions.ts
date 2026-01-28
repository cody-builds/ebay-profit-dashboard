'use client';

import { useQuery } from '@tanstack/react-query';
import { Transaction, APIResponse, PaginationInfo } from '@/lib/types';

interface TransactionFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  condition?: string;
  minProfit?: number;
  maxProfit?: number;
  sortBy?: 'soldDate' | 'soldPrice' | 'netProfit' | 'profitMargin';
  sortOrder?: 'asc' | 'desc';
  dateStart?: string;
  dateEnd?: string;
}

interface TransactionsResponse {
  data: Transaction[];
  pagination: PaginationInfo;
}

async function fetchTransactions(filters: TransactionFilters): Promise<TransactionsResponse> {
  const params = new URLSearchParams();
  
  // Add all non-null filters to search params
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value.toString());
    }
  });

  const response = await fetch(`/api/transactions?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch transactions: ${response.statusText}`);
  }

  const apiResponse: APIResponse<TransactionsResponse> = await response.json();
  
  if (!apiResponse.success) {
    throw new Error('API request failed');
  }

  return apiResponse.data;
}

export function useTransactions(filters: TransactionFilters = {}) {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => fetchTransactions(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Hook for individual transaction
export function useTransaction(transactionId: string) {
  return useQuery({
    queryKey: ['transaction', transactionId],
    queryFn: async () => {
      const response = await fetch(`/api/transactions/${transactionId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch transaction: ${response.statusText}`);
      }

      const apiResponse: APIResponse<Transaction> = await response.json();
      
      if (!apiResponse.success) {
        throw new Error('API request failed');
      }

      return apiResponse.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!transactionId,
  });
}

// Mutation hook for updating transaction costs
export function useUpdateTransactionCost() {
  const { useMutation, useQueryClient } = require('@tanstack/react-query');
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ transactionId, itemCost }: { transactionId: string; itemCost: number }) => {
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemCost }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update transaction: ${response.statusText}`);
      }

      const apiResponse: APIResponse<Transaction> = await response.json();
      
      if (!apiResponse.success) {
        throw new Error('API request failed');
      }

      return apiResponse.data;
    },
    onSuccess: (updatedTransaction) => {
      // Invalidate and refetch transaction queries
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction', updatedTransaction.id] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
    onError: (error) => {
      console.error('Failed to update transaction cost:', error);
    },
  });
}