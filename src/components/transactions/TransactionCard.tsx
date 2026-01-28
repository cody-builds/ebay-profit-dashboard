'use client';

import { useState } from 'react';
import { Transaction } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { CostEditor } from './CostEditor';
import { 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Package, 
  Clock,
  Edit3,
  ExternalLink
} from 'lucide-react';

interface TransactionCardProps {
  transaction: Transaction;
  onCostUpdate: () => void;
}

export function TransactionCard({ transaction, onCostUpdate }: TransactionCardProps) {
  const [isEditingCost, setIsEditingCost] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const isProfit = transaction.netProfit > 0;
  const profitColor = isProfit ? 'text-green-600' : 'text-red-600';
  const profitBgColor = isProfit ? 'bg-green-50' : 'bg-red-50';
  const profitBorderColor = isProfit ? 'border-green-200' : 'border-red-200';

  const handleCostSave = () => {
    setIsEditingCost(false);
    onCostUpdate();
  };

  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="space-y-4">
        {/* Main Transaction Info */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {transaction.title}
            </h3>
            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(transaction.soldDate)}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {transaction.daysListed} days listed
              </div>
              {transaction.category && (
                <div className="flex items-center">
                  <Package className="h-4 w-4 mr-1" />
                  {transaction.category}
                </div>
              )}
            </div>
          </div>
          
          {/* Profit Display */}
          <div className={`px-3 py-2 rounded-lg border ${profitBgColor} ${profitBorderColor}`}>
            <div className="text-right">
              <div className={`text-lg font-semibold ${profitColor} flex items-center`}>
                {isProfit ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                {formatCurrency(transaction.netProfit)}
              </div>
              <div className="text-xs text-gray-600">
                {transaction.profitMargin.toFixed(1)}% margin
              </div>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-xs text-blue-600 font-medium">Sold Price</div>
            <div className="text-sm font-semibold text-blue-900">
              {formatCurrency(transaction.soldPrice)}
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-xs text-gray-600 font-medium">Item Cost</div>
            <div className="text-sm font-semibold text-gray-900 flex items-center">
              {isEditingCost ? (
                <CostEditor
                  transaction={transaction}
                  onSave={handleCostSave}
                  onCancel={() => setIsEditingCost(false)}
                />
              ) : (
                <>
                  {formatCurrency(transaction.itemCost || 0)}
                  <button
                    onClick={() => setIsEditingCost(true)}
                    className="ml-1 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Edit cost"
                  >
                    <Edit3 className="h-3 w-3" />
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="text-xs text-orange-600 font-medium">eBay Fees</div>
            <div className="text-sm font-semibold text-orange-900">
              {formatCurrency(transaction.ebayFees.total)}
            </div>
          </div>

          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="text-xs text-purple-600 font-medium">Shipping</div>
            <div className="text-sm font-semibold text-purple-900">
              {formatCurrency(transaction.shippingCost)}
            </div>
          </div>
        </div>

        {/* Actions & Details Toggle */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
            
            <a
              href={`https://www.ebay.com/itm/${transaction.ebayItemId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-gray-700 flex items-center"
            >
              View on eBay
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </div>
          
          <div className="text-xs text-gray-500">
            Last synced: {formatDate(transaction.syncedAt)}
          </div>
        </div>

        {/* Detailed Breakdown */}
        {showDetails && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <h4 className="font-medium text-gray-900">Transaction Details</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">eBay Transaction ID:</span>
                    <span className="font-mono">{transaction.ebayTransactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">eBay Item ID:</span>
                    <span className="font-mono">{transaction.ebayItemId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Listed Date:</span>
                    <span>{formatDate(transaction.listedDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Condition:</span>
                    <span>{transaction.condition || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping Service:</span>
                    <span>{transaction.shippingService}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="space-y-2">
                  <div className="font-medium text-gray-900">Fee Breakdown</div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Final Value Fee:</span>
                    <span>{formatCurrency(transaction.ebayFees.finalValueFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Processing:</span>
                    <span>{formatCurrency(transaction.ebayFees.paymentProcessingFee)}</span>
                  </div>
                  {transaction.ebayFees.insertionFee && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Insertion Fee:</span>
                      <span>{formatCurrency(transaction.ebayFees.insertionFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-2 font-medium">
                    <span>Total Fees:</span>
                    <span>{formatCurrency(transaction.ebayFees.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profit Calculation */}
            <div className="bg-white p-3 rounded border">
              <div className="font-medium text-gray-900 mb-2">Profit Calculation</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sold Price:</span>
                  <span className="text-green-600">+{formatCurrency(transaction.soldPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Item Cost:</span>
                  <span className="text-red-600">-{formatCurrency(transaction.itemCost || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">eBay Fees:</span>
                  <span className="text-red-600">-{formatCurrency(transaction.ebayFees.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping Cost:</span>
                  <span className="text-red-600">-{formatCurrency(transaction.shippingCost)}</span>
                </div>
                <div className="flex justify-between border-t pt-1 font-semibold">
                  <span>Net Profit:</span>
                  <span className={profitColor}>{formatCurrency(transaction.netProfit)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {transaction.notes && (
              <div>
                <div className="font-medium text-gray-900 mb-1">Notes</div>
                <p className="text-sm text-gray-600">{transaction.notes}</p>
              </div>
            )}

            {/* Tags */}
            {transaction.tags && transaction.tags.length > 0 && (
              <div>
                <div className="font-medium text-gray-900 mb-1">Tags</div>
                <div className="flex flex-wrap gap-1">
                  {transaction.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}