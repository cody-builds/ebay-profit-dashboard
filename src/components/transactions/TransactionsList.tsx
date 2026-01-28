'use client';

import { useTransactions } from '@/hooks/useTransactions';
import { TransactionCard } from './TransactionCard';
import { TransactionListSkeleton } from '@/components/ui/TransactionListSkeleton';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { ShoppingBag } from 'lucide-react';

interface SearchParams {
  [key: string]: string | string[] | undefined;
}

interface TransactionsListProps {
  searchParams: SearchParams;
}

export function TransactionsList({ searchParams }: TransactionsListProps) {
  // Parse search params for filters
  const filters = {
    page: parseInt((searchParams.page as string) || '1'),
    limit: parseInt((searchParams.limit as string) || '20'),
    search: searchParams.search as string,
    category: searchParams.category as string,
    condition: searchParams.condition as string,
    minProfit: searchParams.minProfit ? parseFloat(searchParams.minProfit as string) : undefined,
    maxProfit: searchParams.maxProfit ? parseFloat(searchParams.maxProfit as string) : undefined,
    sortBy: (searchParams.sortBy as any) || 'soldDate',
    sortOrder: (searchParams.sortOrder as any) || 'desc',
    dateStart: searchParams.dateStart as string,
    dateEnd: searchParams.dateEnd as string,
  };

  const { data, isLoading, error, refetch } = useTransactions(filters);

  if (isLoading) {
    return <TransactionListSkeleton />;
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-red-200 p-6">
        <div className="text-center">
          <div className="text-red-600 mb-2">
            <ShoppingBag className="h-12 w-12 mx-auto opacity-50" />
          </div>
          <h3 className="text-lg font-medium text-red-900 mb-2">Failed to Load Transactions</h3>
          <p className="text-red-600 mb-4">
            {error.message || 'There was an error loading your transactions.'}
          </p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="No transactions found"
        description={
          filters.search || filters.category || filters.condition
            ? "No transactions match your current filters. Try adjusting your search criteria."
            : "Connect your eBay account and sync your sales data to get started."
        }
        action={
          filters.search || filters.category || filters.condition
            ? {
                label: 'Clear Filters',
                href: '/transactions',
              }
            : {
                label: 'Connect eBay Account',
                href: '/settings',
              }
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Transactions List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Transactions
            </h2>
            <div className="text-sm text-gray-500">
              {data.pagination.total} total transactions
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {data.data.map((transaction) => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              onCostUpdate={() => refetch()} // Refresh data after cost updates
            />
          ))}
        </div>
      </div>

      {/* Pagination */}
      {data.pagination.pages > 1 && (
        <Pagination
          currentPage={data.pagination.page}
          totalPages={data.pagination.pages}
          totalItems={data.pagination.total}
          itemsPerPage={data.pagination.limit}
        />
      )}
    </div>
  );
}