'use client';

import { useState } from 'react';
import { Search, Filter, SlidersHorizontal, X } from 'lucide-react';

interface SearchFiltersProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: FilterState) => void;
  initialFilters?: FilterState;
}

export interface FilterState {
  minProfit?: number;
  minROI?: number;
  maxBuyPrice?: number;
  sortBy: 'profit' | 'roi' | 'confidence' | 'recent';
  riskLevels: ('low' | 'medium' | 'high')[];
}

export default function SearchFilters({ onSearch, onFilterChange, initialFilters }: SearchFiltersProps) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>(initialFilters || {
    sortBy: 'profit',
    riskLevels: ['low', 'medium', 'high'],
  });
  
  const handleSearchChange = (value: string) => {
    setQuery(value);
    onSearch(value);
  };
  
  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFilterChange(updated);
  };
  
  const toggleRiskLevel = (level: 'low' | 'medium' | 'high') => {
    const current = filters.riskLevels;
    const updated = current.includes(level)
      ? current.filter(l => l !== level)
      : [...current, level];
    handleFilterChange({ riskLevels: updated.length > 0 ? updated : ['low', 'medium', 'high'] });
  };
  
  const clearFilters = () => {
    const reset: FilterState = {
      sortBy: 'profit',
      riskLevels: ['low', 'medium', 'high'],
    };
    setFilters(reset);
    onFilterChange(reset);
  };
  
  const hasActiveFilters = filters.minProfit || filters.minROI || filters.maxBuyPrice || 
    filters.riskLevels.length < 3;
  
  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search cards (e.g., Charizard, Umbreon VMAX)"
          className="w-full bg-gray-900 border border-gray-800 rounded-xl py-3 pl-12 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${
            showFilters || hasActiveFilters ? 'bg-blue-500/20 text-blue-400' : 'text-gray-500 hover:text-gray-400'
          }`}
        >
          <SlidersHorizontal size={18} />
        </button>
      </div>
      
      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-4 animate-slide-up">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-white flex items-center gap-2">
              <Filter size={16} />
              Filters
            </h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
              >
                <X size={12} />
                Clear all
              </button>
            )}
          </div>
          
          {/* Sort By */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Sort By</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { key: 'profit', label: 'Profit' },
                { key: 'roi', label: 'ROI' },
                { key: 'confidence', label: 'Confidence' },
                { key: 'recent', label: 'Recent' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => handleFilterChange({ sortBy: key as FilterState['sortBy'] })}
                  className={`py-2 px-3 rounded-lg text-sm transition-colors ${
                    filters.sortBy === key
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Risk Levels */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Risk Level</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'low', label: 'Low', color: 'green' },
                { key: 'medium', label: 'Medium', color: 'yellow' },
                { key: 'high', label: 'High', color: 'red' },
              ].map(({ key, label, color }) => (
                <button
                  key={key}
                  onClick={() => toggleRiskLevel(key as 'low' | 'medium' | 'high')}
                  className={`py-2 px-3 rounded-lg text-sm transition-colors ${
                    filters.riskLevels.includes(key as 'low' | 'medium' | 'high')
                      ? `bg-${color}-500/20 text-${color}-400 border border-${color}-500/30`
                      : 'bg-gray-800 text-gray-500 border border-transparent'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Number Filters */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Min Profit</label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                <input
                  type="number"
                  value={filters.minProfit || ''}
                  onChange={(e) => handleFilterChange({ minProfit: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="0"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 pl-6 pr-2 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Min ROI</label>
              <div className="relative">
                <input
                  type="number"
                  value={filters.minROI || ''}
                  onChange={(e) => handleFilterChange({ minROI: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="0"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 pl-2 pr-6 text-white text-sm focus:outline-none focus:border-blue-500"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Max Buy</label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                <input
                  type="number"
                  value={filters.maxBuyPrice || ''}
                  onChange={(e) => handleFilterChange({ maxBuyPrice: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="∞"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 pl-6 pr-2 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
