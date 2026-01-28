'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import OpportunityCard from '@/components/OpportunityCard';
import SearchFilters, { FilterState } from '@/components/SearchFilters';
import { ArbitrageOpportunity } from '@/lib/types';
import { TrendingUp, Loader2, AlertCircle, Sparkles } from 'lucide-react';

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    sortBy: 'profit',
    riskLevels: ['low', 'medium', 'high'],
  });
  
  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        demo: 'true',
        sortBy: filters.sortBy,
      });
      
      if (searchQuery) params.set('query', searchQuery);
      if (filters.minProfit) params.set('minProfit', filters.minProfit.toString());
      if (filters.minROI) params.set('minROI', filters.minROI.toString());
      
      const response = await fetch(`/api/opportunities?${params}`);
      const data = await response.json();
      
      // Apply client-side filters
      let filtered = data.opportunities;
      
      // Filter by risk levels
      if (filters.riskLevels.length < 3) {
        filtered = filtered.filter((opp: ArbitrageOpportunity) => 
          filters.riskLevels.includes(opp.riskLevel)
        );
      }
      
      // Filter by max buy price
      if (filters.maxBuyPrice) {
        filtered = filtered.filter((opp: ArbitrageOpportunity) => 
          opp.totalBuyCost <= filters.maxBuyPrice!
        );
      }
      
      setOpportunities(filtered);
    } catch (err) {
      setError('Failed to fetch opportunities');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters]);
  
  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);
  
  // Summary stats
  const stats = {
    total: opportunities.length,
    profitable: opportunities.filter(o => o.netProfit > 0).length,
    avgProfit: opportunities.length > 0 
      ? opportunities.reduce((sum, o) => sum + o.netProfit, 0) / opportunities.length 
      : 0,
    bestDeal: opportunities.length > 0 ? opportunities[0] : null,
  };
  
  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
            <TrendingUp className="text-green-400" />
            Arbitrage Opportunities
          </h1>
          <p className="text-gray-400">
            Find profitable Pokemon cards to flip from TCGPlayer to eBay
          </p>
        </div>
        
        {/* Search & Filters */}
        <div className="mb-6">
          <SearchFilters
            onSearch={setSearchQuery}
            onFilterChange={setFilters}
            initialFilters={filters}
          />
        </div>
        
        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-gray-900 rounded-xl p-3 border border-gray-800">
            <div className="text-xs text-gray-500 mb-1">Total Deals</div>
            <div className="text-xl font-bold text-white">{stats.total}</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-3 border border-gray-800">
            <div className="text-xs text-gray-500 mb-1">Profitable</div>
            <div className="text-xl font-bold text-green-400">{stats.profitable}</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-3 border border-gray-800">
            <div className="text-xs text-gray-500 mb-1">Avg Profit</div>
            <div className="text-xl font-bold text-white">
              ${stats.avgProfit.toFixed(2)}
            </div>
          </div>
          <div className="bg-gray-900 rounded-xl p-3 border border-gray-800">
            <div className="text-xs text-gray-500 mb-1">Best Deal</div>
            <div className="text-xl font-bold text-green-400">
              {stats.bestDeal ? `$${stats.bestDeal.netProfit.toFixed(2)}` : '-'}
            </div>
          </div>
        </div>
        
        {/* Results */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-blue-400 mb-4" size={40} />
            <p className="text-gray-400">Scanning for opportunities...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="text-red-400 mb-4" size={40} />
            <p className="text-red-400">{error}</p>
            <button
              onClick={fetchOpportunities}
              className="mt-4 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
            >
              Try Again
            </button>
          </div>
        ) : opportunities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Sparkles className="text-gray-600 mb-4" size={40} />
            <p className="text-gray-400">No opportunities match your filters</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {opportunities.map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
