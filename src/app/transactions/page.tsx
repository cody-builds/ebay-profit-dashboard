import { Suspense } from 'react';
import { TransactionsList } from '@/components/transactions/TransactionsList';
import { TransactionFilters } from '@/components/transactions/TransactionFilters';
import { TransactionsHeader } from '@/components/transactions/TransactionsHeader';
import { TransactionsSkeleton } from '@/components/ui/TransactionsSkeleton';

interface SearchParams {
  [key: string]: string | string[] | undefined;
}

interface TransactionsPageProps {
  searchParams: SearchParams;
}

export default function TransactionsPage({ searchParams }: TransactionsPageProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <TransactionsHeader />

      {/* Filters */}
      <TransactionFilters />

      {/* Transactions List */}
      <Suspense fallback={<TransactionsSkeleton />}>
        <TransactionsList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}