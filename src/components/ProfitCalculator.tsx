'use client';

import { useState, useEffect } from 'react';
import { calculateProfit, formatCurrency, formatPercent, DEFAULT_FEES } from '@/lib/calculator';
import { Calculator, TrendingUp, TrendingDown, Info } from 'lucide-react';

export default function ProfitCalculator() {
  const [buyPrice, setBuyPrice] = useState<string>('50.00');
  const [buyShipping, setBuyShipping] = useState<string>('0');
  const [sellPrice, setSellPrice] = useState<string>('75.00');
  const [shippingMethod, setShippingMethod] = useState<'pwe' | 'bubble' | 'bmwt'>('pwe');
  
  const [result, setResult] = useState<ReturnType<typeof calculateProfit> | null>(null);
  
  useEffect(() => {
    const buy = parseFloat(buyPrice) || 0;
    const ship = parseFloat(buyShipping) || 0;
    const sell = parseFloat(sellPrice) || 0;
    
    if (buy > 0 && sell > 0) {
      const costs = { pwe: 1.50, bubble: 4.50, bmwt: 5.50 };
      const fees = { ...DEFAULT_FEES, estimatedShipping: costs[shippingMethod] };
      setResult(calculateProfit(buy, ship, sell, fees));
    } else {
      setResult(null);
    }
  }, [buyPrice, buyShipping, sellPrice, shippingMethod]);
  
  const isProfitable = result ? result.netProfit > 0 : false;
  
  return (
    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="text-blue-400" size={24} />
        <h2 className="text-xl font-bold text-white">Profit Calculator</h2>
      </div>
      
      {/* Inputs */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm text-gray-400 mb-1">TCGPlayer Price</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              step="0.01"
              value={buyPrice}
              onChange={(e) => setBuyPrice(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 pl-8 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="0.00"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-1">TCGPlayer Shipping</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              step="0.01"
              value={buyShipping}
              onChange={(e) => setBuyShipping(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 pl-8 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="0.00"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-1">eBay Sale Price</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              step="0.01"
              value={sellPrice}
              onChange={(e) => setSellPrice(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 pl-8 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="0.00"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-2">Your Shipping Method</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: 'pwe', label: 'PWE', cost: 1.50, desc: 'Plain envelope' },
              { key: 'bubble', label: 'Bubble', cost: 4.50, desc: 'No tracking' },
              { key: 'bmwt', label: 'BMWT', cost: 5.50, desc: 'With tracking' },
            ].map((method) => (
              <button
                key={method.key}
                onClick={() => setShippingMethod(method.key as 'pwe' | 'bubble' | 'bmwt')}
                className={`p-2 rounded-lg border text-center transition-all ${
                  shippingMethod === method.key
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                    : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                }`}
              >
                <div className="font-medium text-sm">{method.label}</div>
                <div className="text-xs opacity-70">${method.cost.toFixed(2)}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Main Result */}
          <div className={`p-4 rounded-xl ${isProfitable ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Net Profit</span>
              {isProfitable ? (
                <TrendingUp className="text-green-400" size={20} />
              ) : (
                <TrendingDown className="text-red-400" size={20} />
              )}
            </div>
            <div className={`text-3xl font-bold ${isProfitable ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(result.netProfit)}
            </div>
            <div className={`text-sm ${isProfitable ? 'text-green-400/70' : 'text-red-400/70'}`}>
              {formatPercent(result.roi)} ROI • {formatPercent(result.profitMargin)} margin
            </div>
          </div>
          
          {/* Breakdown */}
          <div className="bg-gray-800/50 rounded-xl p-4 space-y-2">
            <div className="text-sm font-medium text-gray-400 mb-3">Breakdown</div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Buy cost (card + shipping)</span>
              <span className="text-white">{formatCurrency(result.totalBuyCost)}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Sale price</span>
              <span className="text-white">{formatCurrency(parseFloat(sellPrice) || 0)}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Gross profit</span>
              <span className={result.grossProfit >= 0 ? 'text-green-400' : 'text-red-400'}>
                {formatCurrency(result.grossProfit)}
              </span>
            </div>
            
            <div className="border-t border-gray-700 my-2"></div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 flex items-center gap-1">
                eBay fees (13.25% + $0.30)
                <Info size={12} className="opacity-50" />
              </span>
              <span className="text-red-400">-{formatCurrency(result.ebayFees)}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Your shipping cost</span>
              <span className="text-red-400">-{formatCurrency(result.shippingCost)}</span>
            </div>
            
            <div className="border-t border-gray-700 my-2"></div>
            
            <div className="flex justify-between font-medium">
              <span className="text-white">Net Profit</span>
              <span className={isProfitable ? 'text-green-400' : 'text-red-400'}>
                {formatCurrency(result.netProfit)}
              </span>
            </div>
          </div>
          
          {/* Quick Tips */}
          {!isProfitable && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Info size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-400/90">
                  <strong>Tip:</strong> Look for cards where TCGPlayer price is at least 25-30% below eBay sold average to ensure profit after fees.
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
