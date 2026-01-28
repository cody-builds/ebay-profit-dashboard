'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Search, 
  Filter, 
  X, 
  Calendar, 
  DollarSign,
  Package,
  SortAsc,
  SortDesc
} from 'lucide-react';

export function TransactionFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Filter states
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [condition, setCondition] = useState(searchParams.get('condition') || '');
  const [minProfit, setMinProfit] = useState(searchParams.get('minProfit') || '');
  const [maxProfit, setMaxProfit] = useState(searchParams.get('maxProfit') || '');
  const [dateStart, setDateStart] = useState(searchParams.get('dateStart') || '');
  const [dateEnd, setDateEnd] = useState(searchParams.get('dateEnd') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'soldDate');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc');

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Check if any filters are active
  const hasActiveFilters = search || category || condition || minProfit || maxProfit || dateStart || dateEnd;

  // Categories and conditions (would normally come from API)
  const categories = [
    'Trading Cards',
    'Electronics',
    'Collectibles',
    'Toys & Games',
    'Books',
    'Clothing',
    'Sports',
    'Other'
  ];

  const conditions = [
    'New',
    'Like New',
    'Excellent',
    'Very Good',
    'Good',
    'Acceptable',
    'For Parts'
  ];

  const sortOptions = [
    { value: 'soldDate', label: 'Sale Date' },
    { value: 'soldPrice', label: 'Sale Price' },
    { value: 'netProfit', label: 'Net Profit' },
    { value: 'profitMargin', label: 'Profit Margin' },
  ];

  // Apply filters to URL
  const applyFilters = useCallback(() => {
    const params = new URLSearchParams();
    
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (condition) params.set('condition', condition);
    if (minProfit) params.set('minProfit', minProfit);
    if (maxProfit) params.set('maxProfit', maxProfit);
    if (dateStart) params.set('dateStart', dateStart);
    if (dateEnd) params.set('dateEnd', dateEnd);
    if (sortBy) params.set('sortBy', sortBy);
    if (sortOrder) params.set('sortOrder', sortOrder);

    // Reset to page 1 when filters change
    params.set('page', '1');
    
    router.push(`/transactions?${params.toString()}`);
  }, [search, category, condition, minProfit, maxProfit, dateStart, dateEnd, sortBy, sortOrder, router]);

  // Clear all filters
  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setCondition('');
    setMinProfit('');
    setMaxProfit('');
    setDateStart('');
    setDateEnd('');
    setSortBy('soldDate');
    setSortOrder('desc');
    router.push('/transactions');
  };

  // Auto-apply search filter with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      applyFilters();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, applyFilters]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
          >
            <Filter className="h-4 w-4 mr-1" />
            {showAdvancedFilters ? 'Hide Filters' : 'More Filters'}
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 hover:text-red-700 flex items-center"
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search transactions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Sort Options */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              applyFilters();
            }}
            className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          <button
            onClick={() => {
              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              applyFilters();
            }}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
          >
            {sortOrder === 'asc' ? (
              <SortAsc className="h-4 w-4" />
            ) : (
              <SortDesc className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Package className="h-4 w-4 inline mr-1" />
              Category
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                applyFilters();
              }}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Condition Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Condition
            </label>
            <select
              value={condition}
              onChange={(e) => {
                setCondition(e.target.value);
                applyFilters();
              }}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Conditions</option>
              {conditions.map((cond) => (
                <option key={cond} value={cond}>
                  {cond}
                </option>
              ))}
            </select>
          </div>

          {/* Profit Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <DollarSign className="h-4 w-4 inline mr-1" />
              Profit Range
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={minProfit}
                onChange={(e) => setMinProfit(e.target.value)}
                onBlur={applyFilters}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-gray-500">to</span>
              <input
                type="number"
                placeholder="Max"
                value={maxProfit}
                onChange={(e) => setMaxProfit(e.target.value)}
                onBlur={applyFilters}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="h-4 w-4 inline mr-1" />
              Sale Date Range
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={dateStart}
                onChange={(e) => {
                  setDateStart(e.target.value);
                  applyFilters();
                }}
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={dateEnd}
                onChange={(e) => {
                  setDateEnd(e.target.value);
                  applyFilters();
                }}
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-200">
          <span className="text-sm text-gray-600">Active filters:</span>
          {search && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
              Search: &quot;{search}&quot;
              <button
                onClick={() => setSearch('')}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {category && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
              {category}
              <button
                onClick={() => setCategory('')}
                className="ml-1 text-green-600 hover:text-green-800"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {condition && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
              {condition}
              <button
                onClick={() => setCondition('')}
                className="ml-1 text-purple-600 hover:text-purple-800"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {(minProfit || maxProfit) && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
              ${minProfit || '0'} - ${maxProfit || '∞'}
              <button
                onClick={() => {
                  setMinProfit('');
                  setMaxProfit('');
                }}
                className="ml-1 text-orange-600 hover:text-orange-800"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}