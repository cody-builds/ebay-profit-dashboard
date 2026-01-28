import { Package, Calendar, DollarSign, TrendingUp, Edit3 } from 'lucide-react';
import { Transaction } from '@/lib/types';

interface TransactionCardProps {
  transaction: Transaction;
  compact?: boolean;
  showActions?: boolean;
}

export function TransactionCard({ transaction, compact = false, showActions = true }: TransactionCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const profitColor = transaction.netProfit >= 0 ? 'text-green-600' : 'text-red-600';
  const profitBg = transaction.netProfit >= 0 ? 'bg-green-50' : 'bg-red-50';

  if (compact) {
    return (
      <div className="flex items-center space-x-4 p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Package className="h-5 w-5 text-blue-600" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {transaction.title}
          </p>
          <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
            <span>{formatDate(transaction.soldDate)}</span>
            <span>{formatCurrency(transaction.soldPrice)}</span>
          </div>
        </div>

        <div className="flex-shrink-0 text-right">
          <p className={`text-sm font-semibold ${profitColor}`}>
            {transaction.netProfit >= 0 ? '+' : ''}{formatCurrency(transaction.netProfit)}
          </p>
          <p className="text-xs text-gray-500">
            {transaction.profitMargin.toFixed(1)}%
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-gray-300 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Package className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
              {transaction.title}
            </h3>
            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(transaction.soldDate)}
              </div>
              {transaction.category && (
                <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                  {transaction.category}
                </span>
              )}
              {transaction.condition && (
                <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                  {transaction.condition}
                </span>
              )}
            </div>
          </div>
        </div>

        {showActions && (
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50">
            <Edit3 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Financial Details */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Sold Price</p>
          <p className="font-semibold text-gray-900">{formatCurrency(transaction.soldPrice)}</p>
        </div>
        
        <div>
          <p className="text-xs text-gray-500 mb-1">Item Cost</p>
          <p className="font-semibold text-gray-900">
            {transaction.itemCost ? formatCurrency(transaction.itemCost) : '-'}
          </p>
        </div>
        
        <div>
          <p className="text-xs text-gray-500 mb-1">eBay Fees</p>
          <p className="font-semibold text-gray-900">{formatCurrency(transaction.ebayFees.total)}</p>
        </div>
        
        <div>
          <p className="text-xs text-gray-500 mb-1">Shipping</p>
          <p className="font-semibold text-gray-900">{formatCurrency(transaction.shippingCost)}</p>
        </div>
      </div>

      {/* Profit Summary */}
      <div className={`flex items-center justify-between p-3 rounded-lg ${profitBg}`}>
        <div className="flex items-center space-x-2">
          <TrendingUp className={`h-5 w-5 ${profitColor}`} />
          <span className="font-medium text-gray-900">Net Profit</span>
        </div>
        
        <div className="text-right">
          <p className={`text-lg font-bold ${profitColor}`}>
            {transaction.netProfit >= 0 ? '+' : ''}{formatCurrency(transaction.netProfit)}
          </p>
          <p className={`text-sm ${profitColor}`}>
            {transaction.profitMargin.toFixed(1)}% margin
          </p>
        </div>
      </div>

      {/* Additional Details */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Listed for {transaction.daysListed} days</span>
          <span>Sync: {transaction.syncStatus}</span>
        </div>
        
        {transaction.notes && (
          <div className="mt-2">
            <p className="text-sm text-gray-600 italic">"{transaction.notes}"</p>
          </div>
        )}
      </div>
    </div>
  );
}