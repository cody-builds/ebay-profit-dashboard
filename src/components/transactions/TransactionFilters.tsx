'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Search, Filter, X, Calendar, DollarSign } from 'lucide-react';

export function TransactionFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    condition: searchParams.get('condition') || '',
    minProfit: searchParams.get('minProfit') || '',
    maxProfit: searchParams.get('maxProfit') || '',
    dateFrom: searchParams.get('dateFrom') || '',
    dateTo: searchParams.get('dateTo') || '',
  });

  const updateURL = useCallback((newFilters: typeof filters) => {
    const params = new URLSearchParams();
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    const queryString = params.toString();
    router.push(`/transactions${queryString ? `?${queryString}` : ''}`);
  }, [router]);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Debounce search input, apply others immediately
    if (key === 'search') {
      const timeoutId = setTimeout(() => updateURL(newFilters), 300);
      return () => clearTimeout(timeoutId);
    } else {
      updateURL(newFilters);
    }
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      category: '',
      condition: '',
      minProfit: '',
      maxProfit: '',
      dateFrom: '',
      dateTo: '',
    };
    setFilters(clearedFilters);
    updateURL(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* Main Filter Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search transactions, items, categories..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className={isExpanded ? 'bg-gray-100' : ''}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 bg-blue-600 text-white rounded-full text-xs px-1.5 py-0.5">
                {Object.values(filters).filter(v => v !== '').length}
              </span>
            )}
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Category
              </label>
              <Select
                value={filters.category}
                onValueChange={(value) => handleFilterChange('category', value)}
              >
                <option value="">All Categories</option>
                <option value="Trading Cards">Trading Cards</option>
                <option value="Electronics">Electronics</option>
                <option value="Books">Books</option>
                <option value="Collectibles">Collectibles</option>
                <option value="Other">Other</option>
              </Select>
            </div>

            {/* Condition Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Condition
              </label>
              <Select
                value={filters.condition}
                onValueChange={(value) => handleFilterChange('condition', value)}
              >
                <option value="">All Conditions</option>
                <option value="Near Mint">Near Mint</option>
                <option value="Lightly Played">Lightly Played</option>
                <option value="Moderately Played">Moderately Played</option>
                <option value="Heavily Played">Heavily Played</option>
                <option value="Damaged">Damaged</option>
              </Select>
            </div>

            {/* Min Profit */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                Min Profit
              </label>
              <Input
                type="number"
                placeholder="0.00"
                value={filters.minProfit}
                onChange={(e) => handleFilterChange('minProfit', e.target.value)}
                min="0"
                step="0.01"
              />
            </div>

            {/* Max Profit */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                Max Profit
              </label>
              <Input
                type="number"
                placeholder="1000.00"
                value={filters.maxProfit}
                onChange={(e) => handleFilterChange('maxProfit', e.target.value)}
                min="0"
                step="0.01"
              />
            </div>

            {/* Date From */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                From Date
              </label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>

            {/* Date To */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                To Date
              </label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>
          </div>

          {/* Quick Filter Buttons */}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFilterChange('dateFrom', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])}
            >
              Last 7 Days
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFilterChange('dateFrom', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])}
            >
              Last 30 Days
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFilterChange('minProfit', '10')}
            >
              Profit &gt; $10
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFilterChange('minProfit', '50')}
            >
              Profit &gt; $50
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}