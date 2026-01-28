'use client';

import Header from '@/components/Header';
import ProfitCalculator from '@/components/ProfitCalculator';
import { Calculator, Info, DollarSign, Percent, Truck, CreditCard } from 'lucide-react';

export default function CalculatorPage() {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
            <Calculator className="text-blue-400" />
            Profit Calculator
          </h1>
          <p className="text-gray-400">
            Calculate your real profit after all eBay fees and shipping costs
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Calculator */}
          <ProfitCalculator />
          
          {/* Fee Guide */}
          <div className="space-y-4">
            {/* eBay Fees */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
                <CreditCard className="text-blue-400" size={20} />
                eBay Fee Structure
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
                  <Percent className="text-blue-400 flex-shrink-0 mt-0.5" size={18} />
                  <div>
                    <div className="font-medium text-white">Final Value Fee</div>
                    <div className="text-sm text-gray-400">
                      <strong className="text-blue-400">13.25%</strong> of total sale amount for Trading Cards category
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
                  <DollarSign className="text-green-400 flex-shrink-0 mt-0.5" size={18} />
                  <div>
                    <div className="font-medium text-white">Per-Transaction Fee</div>
                    <div className="text-sm text-gray-400">
                      <strong className="text-green-400">$0.30</strong> per order (eBay Managed Payments)
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-400/90">
                    PayPal fees are now included in eBay&apos;s Managed Payments system - no separate fee calculation needed.
                  </div>
                </div>
              </div>
            </div>
            
            {/* Shipping Guide */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
                <Truck className="text-purple-400" size={20} />
                Shipping Guide
              </h3>
              
              <div className="space-y-3">
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-white">PWE (Plain White Envelope)</span>
                    <span className="text-green-400 font-mono">~$1.50</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    Best for cards under $20. No tracking. Use toploader + team bag.
                  </div>
                </div>
                
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-white">Bubble Mailer</span>
                    <span className="text-yellow-400 font-mono">~$4.50</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    Better protection. Still no tracking typically.
                  </div>
                </div>
                
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-white">BMWT (Bubble Mail w/ Tracking)</span>
                    <span className="text-blue-400 font-mono">~$5.50</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    Recommended for cards $20+. Full tracking, buyer protection.
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info size={16} className="text-purple-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-purple-400/90">
                    <strong>Pro tip:</strong> For high-value cards ($50+), always use BMWT with signature confirmation. The extra cost is worth the protection.
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Reference */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-900/50 rounded-2xl p-6 border border-gray-700">
              <h3 className="font-semibold text-white mb-4">Quick Profit Rules</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span className="text-gray-300">
                    <strong className="text-white">25%+ price gap</strong> = Usually profitable after fees
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                  <span className="text-gray-300">
                    <strong className="text-white">15-25% gap</strong> = Check shipping costs carefully
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                  <span className="text-gray-300">
                    <strong className="text-white">&lt;15% gap</strong> = Likely not worth it
                  </span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="text-xs text-gray-500">
                  Formula: Net Profit = Sale Price - Buy Cost - (Sale × 13.25%) - $0.30 - Shipping
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
