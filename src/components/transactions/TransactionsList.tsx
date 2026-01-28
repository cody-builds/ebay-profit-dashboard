'use client';

import { useState, useEffect } from 'react';
import { Transaction } from '@/lib/types';
import { ItemCostInput } from './ItemCostInput';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  ArrowUpDown, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Clock,
  Package,
  ExternalLink,
  Loader2
} from 'lucide-react';

interface SearchParams {
  [key: string]: string | string[] | undefined;
}

interface TransactionsListProps {
  searchParams: SearchParams;
}

export function TransactionsList({ searchParams }: TransactionsListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'soldDate' | 'soldPrice' | 'netProfit' | 'profitMargin'>('soldDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchTransactions();
  }, [searchParams, sortBy, sortOrder]);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      
      const params = new URLSearchParams();
      if (sortBy) params.append('sortBy', sortBy);
      if (sortOrder) params.append('sortOrder', sortOrder);
      
      // Add search params from URL
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value) {
          params.append(key, Array.isArray(value) ? value[0] : value);
        }
      });

      const response = await fetch(`/api/transactions?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setTransactions(data.data || []);
      } else {
        throw new Error(data.error?.message || 'Failed to fetch transactions');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
      console.error('Error fetching transactions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCostUpdate = async (transactionId: string, newCost: number) => {
    try {
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemCost: newCost }),
      });

      const data = await response.json();

      if (data.success) {
        // Update the transaction in local state
        setTransactions(prev => 
          prev.map(t => t.id === transactionId ? data.data : t)
        );
      } else {
        throw new Error(data.error?.message || 'Failed to update cost');
      }
    } catch (error) {
      console.error('Error updating cost:', error);
      throw error; // Re-throw so ItemCostInput can handle it
    }
  };

  const handleSort = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getProfitColor = (profit: number, margin: number) => {
    if (profit < 0) return 'text-red-600';
    if (margin < 10) return 'text-yellow-600';
    if (margin < 20) return 'text-blue-600';
    return 'text-green-600';
  };

  const getConditionBadge = (condition: string) => {
    const variants: Record<string, 'success' | 'warning' | 'secondary'> = {
      'Near Mint': 'success',
      'Lightly Played': 'warning',
      'Moderately Played': 'warning',
      'Heavily Played': 'secondary',
      'Damaged': 'secondary',
    };
    
    return variants[condition] || 'secondary';
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 font-medium mb-2">Error loading transactions</p>
        <p className="text-red-600 text-sm mb-4">{error}</p>
        <Button onClick={fetchTransactions} variant="outline" size="sm">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Table Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
        <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wide">
          <div className="col-span-3">
            <button
              onClick={() => handleSort('soldDate')}
              className="flex items-center gap-1 hover:text-gray-700"
            >
              <Calendar className="h-3 w-3" />
              Date Sold
              <ArrowUpDown className="h-3 w-3" />
            </button>
          </div>
          <div className="col-span-3">Item</div>
          <div className="col-span-1">
            <button
              onClick={() => handleSort('soldPrice')}
              className="flex items-center gap-1 hover:text-gray-700"
            >
              <DollarSign className="h-3 w-3" />
              Sold
              <ArrowUpDown className="h-3 w-3" />
            </button>
          </div>
          <div className="col-span-1">Cost</div>
          <div className="col-span-1">
            <button
              onClick={() => handleSort('netProfit')}
              className="flex items-center gap-1 hover:text-gray-700"
            >
              <TrendingUp className="h-3 w-3" />
              Profit
              <ArrowUpDown className="h-3 w-3" />
            </button>
          </div>
          <div className="col-span-1">
            <button
              onClick={() => handleSort('profitMargin')}
              className="flex items-center gap-1 hover:text-gray-700"
            >
              Margin
              <ArrowUpDown className="h-3 w-3" />
            </button>
          </div>
          <div className="col-span-1">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Days
            </div>
          </div>
          <div className="col-span-1">Actions</div>
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-200">
        {isLoading ? (
          <div className="px-6 py-8 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-gray-400" />
            <p className="text-gray-500">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
            <p className="text-gray-500 mb-4">
              Connect your eBay account or adjust your filters to see transactions.
            </p>
            <Button variant="outline" onClick={fetchTransactions}>
              Refresh
            </Button>
          </div>
        ) : (
          transactions.map((transaction) => (
            <div key={transaction.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Date */}
                <div className="col-span-3">
                  <div className="text-sm font-medium text-gray-900">
                    {formatDate(transaction.soldDate)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Listed: {formatDate(transaction.listedDate)}
                  </div>
                </div>

                {/* Item */}
                <div className="col-span-3">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {transaction.title}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={getConditionBadge(transaction.condition || '')}>
                      {transaction.condition}
                    </Badge>
                    {transaction.category && (
                      <span className="text-xs text-gray-500">{transaction.category}</span>
                    )}
                  </div>
                </div>

                {/* Sold Price */}
                <div className="col-span-1">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(transaction.soldPrice)}
                  </div>
                  <div className="text-xs text-gray-500">
                    + {formatCurrency(transaction.shippingCost)} ship
                  </div>
                </div>

                {/* Cost */}
                <div className="col-span-1">
                  <ItemCostInput
                    transactionId={transaction.id}
                    currentCost={transaction.itemCost}
                    onCostUpdate={handleCostUpdate}
                  />
                </div>

                {/* Profit */}
                <div className="col-span-1">
                  <div className={`text-sm font-medium ${getProfitColor(transaction.netProfit, transaction.profitMargin)}`}>
                    {formatCurrency(transaction.netProfit)}
                  </div>
                </div>

                {/* Margin */}
                <div className="col-span-1">
                  <div className={`text-sm font-medium ${getProfitColor(transaction.netProfit, transaction.profitMargin)}`}>
                    {transaction.profitMargin.toFixed(1)}%
                  </div>
                </div>

                {/* Days Listed */}
                <div className="col-span-1">
                  <div className="text-sm text-gray-900">
                    {transaction.daysListed}
                  </div>
                </div>

                {/* Actions */}
                <div className="col-span-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(`https://www.ebay.com/itm/${transaction.ebayItemId}`, '_blank')}
                    className="h-6 w-6 p-0"
                    title="View on eBay"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Additional Info Row (if needed) */}
              {transaction.notes && (
                <div className="mt-2 text-xs text-gray-600 pl-0">
                  <strong>Notes:</strong> {transaction.notes}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {!isLoading && transactions.length > 0 && (
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-3">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div>
              Showing {transactions.length} transactions
            </div>
            <div>
              Total Profit: {formatCurrency(transactions.reduce((sum, t) => sum + t.netProfit, 0))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}