'use client';

import { ArbitrageOpportunity } from '@/lib/types';
import { formatCurrency, formatPercent } from '@/lib/calculator';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  ExternalLink,
  ShoppingCart,
  DollarSign,
  Percent,
  Activity
} from 'lucide-react';

interface OpportunityCardProps {
  opportunity: ArbitrageOpportunity;
  onSelect?: (opp: ArbitrageOpportunity) => void;
}

export default function OpportunityCard({ opportunity, onSelect }: OpportunityCardProps) {
  const isProfitable = opportunity.netProfit > 0;
  const isHighProfit = opportunity.netProfit > 15;
  const isHighROI = opportunity.roi > 20;
  
  const getRiskBadge = () => {
    switch (opportunity.riskLevel) {
      case 'low':
        return <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full">Low Risk</span>;
      case 'medium':
        return <span className="px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded-full">Medium Risk</span>;
      case 'high':
        return <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded-full">High Risk</span>;
    }
  };
  
  return (
    <div 
      className={`
        relative p-4 rounded-xl border transition-all duration-200 cursor-pointer
        ${isProfitable 
          ? 'bg-gradient-to-br from-gray-900 to-gray-900/50 border-green-500/30 hover:border-green-500/50 card-glow-profit' 
          : 'bg-gray-900/50 border-red-500/30 hover:border-red-500/50 card-glow-loss'}
        ${isHighProfit ? 'profit-pulse' : ''}
      `}
      onClick={() => onSelect?.(opportunity)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{opportunity.card.name}</h3>
          <p className="text-sm text-gray-400 truncate">{opportunity.card.set}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {getRiskBadge()}
          <span className="text-xs text-gray-500">{opportunity.card.condition}</span>
        </div>
      </div>
      
      {/* Price Comparison */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
            <ShoppingCart size={12} />
            <span>TCGPlayer Buy</span>
          </div>
          <div className="font-semibold text-lg text-white">
            {formatCurrency(opportunity.tcgPrice)}
          </div>
          {opportunity.tcgShipping > 0 && (
            <div className="text-xs text-gray-500">+{formatCurrency(opportunity.tcgShipping)} ship</div>
          )}
        </div>
        
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
            <DollarSign size={12} />
            <span>eBay Avg Sold</span>
          </div>
          <div className="font-semibold text-lg text-white">
            {formatCurrency(opportunity.ebayAvgSold)}
          </div>
          <div className="text-xs text-gray-500">
            {opportunity.recentSalesCount} recent sales
          </div>
        </div>
      </div>
      
      {/* Profit Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className={`rounded-lg p-2 text-center ${isProfitable ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
          <div className="text-xs text-gray-400 mb-0.5">Net Profit</div>
          <div className={`font-bold ${isProfitable ? 'text-green-400' : 'text-red-400'}`}>
            {isProfitable && <TrendingUp size={12} className="inline mr-1" />}
            {!isProfitable && <TrendingDown size={12} className="inline mr-1" />}
            {formatCurrency(opportunity.netProfit)}
          </div>
        </div>
        
        <div className={`rounded-lg p-2 text-center ${isHighROI ? 'bg-blue-500/10' : 'bg-gray-800/50'}`}>
          <div className="text-xs text-gray-400 mb-0.5">ROI</div>
          <div className={`font-bold ${isHighROI ? 'text-blue-400' : 'text-gray-300'}`}>
            <Percent size={12} className="inline mr-1" />
            {formatPercent(opportunity.roi)}
          </div>
        </div>
        
        <div className="rounded-lg p-2 text-center bg-gray-800/50">
          <div className="text-xs text-gray-400 mb-0.5">Confidence</div>
          <div className="font-bold text-gray-300">
            <Activity size={12} className="inline mr-1" />
            {opportunity.confidence}%
          </div>
        </div>
      </div>
      
      {/* Fee Breakdown (collapsed) */}
      <div className="text-xs text-gray-500 mb-3 space-y-0.5">
        <div className="flex justify-between">
          <span>Total buy cost:</span>
          <span>{formatCurrency(opportunity.totalBuyCost)}</span>
        </div>
        <div className="flex justify-between">
          <span>eBay fees (13.25% + $0.30):</span>
          <span>-{formatCurrency(opportunity.ebayFees)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping cost:</span>
          <span>-{formatCurrency(opportunity.estimatedShipping)}</span>
        </div>
      </div>
      
      {/* Action Hint */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          {isProfitable ? (
            <>
              <CheckCircle size={12} className="text-green-400" />
              <span className="text-green-400">Profitable flip</span>
            </>
          ) : (
            <>
              <AlertTriangle size={12} className="text-red-400" />
              <span className="text-red-400">Not profitable</span>
            </>
          )}
        </div>
        <a 
          href={opportunity.card.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
          onClick={(e) => e.stopPropagation()}
        >
          View listing <ExternalLink size={10} />
        </a>
      </div>
    </div>
  );
}
