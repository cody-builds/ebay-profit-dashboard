'use client';

import Link from 'next/link';
import { ArrowRight, Package, DollarSign, Calendar } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { TransactionCard } from '@/components/ui/TransactionCard';

export function RecentTransactions() {
  const { data: transactionsData, isLoading, error } = useTransactions({
    sortBy: 'soldDate',
    sortOrder: 'desc',
    limit: 5
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
                <div className="w-20 h-6 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-red-200 p-6">
        <div className="text-center text-red-600">
          <Package className="h-12 w-12 mx-auto mb-4 text-red-400" />
          <p className="font-medium">Failed to load recent transactions</p>
          <p className="text-sm text-red-500 mt-1">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  const transactions = transactionsData?.data || [];

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
        </div>
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 mb-2">No transactions found</p>
          <p className="text-sm text-gray-500">
            Connect your eBay account to start tracking your sales
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
        <Link
          href="/transactions"
          className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          View all
          <ArrowRight className="h-4 w-4 ml-1" />
        </Link>
      </div>

      <div className="space-y-4">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
            </div>

            {/* Transaction Details */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {transaction.title}
              </p>
              <div className="flex items-center space-x-4 mt-1">
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(transaction.soldDate).toLocaleDateString()}
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <DollarSign className="h-3 w-3 mr-1" />
                  ${transaction.soldPrice.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Profit */}
            <div className="flex-shrink-0 text-right">
              <p className={`text-sm font-semibold ${
                transaction.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {transaction.netProfit >= 0 ? '+' : ''}${transaction.netProfit.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">
                {transaction.profitMargin.toFixed(1)}% margin
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Total from recent sales:</span>
          <span className={`font-semibold ${
            transactions.reduce((sum, t) => sum + t.netProfit, 0) >= 0
              ? 'text-green-600'
              : 'text-red-600'
          }`}>
            ${transactions.reduce((sum, t) => sum + t.netProfit, 0).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}