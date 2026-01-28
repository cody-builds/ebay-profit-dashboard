import { NextRequest, NextResponse } from 'next/server';
import { Transaction, TransactionFilters } from '@/lib/types';

// Mock transaction data - replace with actual database queries
const mockTransactions: Transaction[] = [
  {
    id: '1',
    ebayTransactionId: 'ebay_123456',
    ebayItemId: 'item_789',
    title: 'Pokemon Charizard VMAX - Brilliant Stars',
    soldPrice: 45.99,
    soldDate: new Date('2024-01-20T10:30:00Z'),
    listedDate: new Date('2024-01-15T14:20:00Z'),
    itemCost: 25.00,
    ebayFees: {
      finalValueFee: 6.09,
      paymentProcessingFee: 0.30,
      total: 6.39,
    },
    shippingCost: 4.50,
    shippingService: 'eBay Standard Envelope',
    netProfit: 10.10,
    profitMargin: 21.98,
    daysListed: 5,
    category: 'Trading Cards',
    condition: 'Near Mint',
    syncedAt: new Date('2024-01-20T11:00:00Z'),
    syncStatus: 'synced',
  },
  {
    id: '2',
    ebayTransactionId: 'ebay_234567',
    ebayItemId: 'item_890',
    title: 'Pokemon Pikachu VMAX - Vivid Voltage',
    soldPrice: 32.50,
    soldDate: new Date('2024-01-19T15:45:00Z'),
    listedDate: new Date('2024-01-12T09:15:00Z'),
    itemCost: 18.75,
    ebayFees: {
      finalValueFee: 4.31,
      paymentProcessingFee: 0.30,
      total: 4.61,
    },
    shippingCost: 1.50,
    shippingService: 'PWE',
    netProfit: 7.64,
    profitMargin: 23.51,
    daysListed: 7,
    category: 'Trading Cards',
    condition: 'Near Mint',
    syncedAt: new Date('2024-01-19T16:00:00Z'),
    syncStatus: 'synced',
  },
  {
    id: '3',
    ebayTransactionId: 'ebay_345678',
    ebayItemId: 'item_901',
    title: 'Pokemon Umbreon VMAX - Evolving Skies',
    soldPrice: 68.00,
    soldDate: new Date('2024-01-18T08:22:00Z'),
    listedDate: new Date('2024-01-10T12:00:00Z'),
    itemCost: 42.00,
    ebayFees: {
      finalValueFee: 9.01,
      paymentProcessingFee: 0.30,
      total: 9.31,
    },
    shippingCost: 5.00,
    shippingService: 'eBay Standard Envelope',
    netProfit: 11.69,
    profitMargin: 17.19,
    daysListed: 8,
    category: 'Trading Cards',
    condition: 'Near Mint',
    syncedAt: new Date('2024-01-18T09:00:00Z'),
    syncStatus: 'synced',
  },
  {
    id: '4',
    ebayTransactionId: 'ebay_456789',
    ebayItemId: 'item_012',
    title: 'Pokemon Rayquaza VMAX - Evolving Skies Alt Art',
    soldPrice: 125.99,
    soldDate: new Date('2024-01-17T19:15:00Z'),
    listedDate: new Date('2024-01-14T10:30:00Z'),
    itemCost: 85.00,
    ebayFees: {
      finalValueFee: 16.69,
      paymentProcessingFee: 0.30,
      total: 16.99,
    },
    shippingCost: 6.50,
    shippingService: 'eBay Standard Envelope',
    netProfit: 17.50,
    profitMargin: 13.89,
    daysListed: 3,
    category: 'Trading Cards',
    condition: 'Near Mint',
    syncedAt: new Date('2024-01-17T20:00:00Z'),
    syncStatus: 'synced',
  },
  {
    id: '5',
    ebayTransactionId: 'ebay_567890',
    ebayItemId: 'item_123',
    title: 'Pokemon Leafeon VMAX - Evolving Skies',
    soldPrice: 28.50,
    soldDate: new Date('2024-01-16T14:33:00Z'),
    listedDate: new Date('2024-01-11T16:45:00Z'),
    itemCost: 15.00,
    ebayFees: {
      finalValueFee: 3.78,
      paymentProcessingFee: 0.30,
      total: 4.08,
    },
    shippingCost: 1.50,
    shippingService: 'PWE',
    netProfit: 7.92,
    profitMargin: 27.79,
    daysListed: 5,
    category: 'Trading Cards',
    condition: 'Near Mint',
    syncedAt: new Date('2024-01-16T15:00:00Z'),
    syncStatus: 'synced',
  },
];

function applyFilters(transactions: Transaction[], filters: TransactionFilters): Transaction[] {
  let filtered = [...transactions];

  // Date range filter
  if (filters.dateRange?.start) {
    filtered = filtered.filter(t => new Date(t.soldDate) >= filters.dateRange!.start);
  }
  if (filters.dateRange?.end) {
    filtered = filtered.filter(t => new Date(t.soldDate) <= filters.dateRange!.end);
  }

  // Profit filters
  if (filters.minProfit !== undefined) {
    filtered = filtered.filter(t => t.netProfit >= filters.minProfit!);
  }
  if (filters.maxProfit !== undefined) {
    filtered = filtered.filter(t => t.netProfit <= filters.maxProfit!);
  }

  // Category filter
  if (filters.category) {
    filtered = filtered.filter(t => t.category?.toLowerCase().includes(filters.category!.toLowerCase()));
  }

  // Condition filter
  if (filters.condition) {
    filtered = filtered.filter(t => t.condition?.toLowerCase().includes(filters.condition!.toLowerCase()));
  }

  // Search filter
  if (filters.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(t => 
      t.title.toLowerCase().includes(search) ||
      t.category?.toLowerCase().includes(search) ||
      t.notes?.toLowerCase().includes(search)
    );
  }

  // Sorting
  if (filters.sortBy) {
    filtered.sort((a, b) => {
      const aVal = a[filters.sortBy!] as any;
      const bVal = b[filters.sortBy!] as any;
      
      let comparison = 0;
      if (aVal < bVal) comparison = -1;
      if (aVal > bVal) comparison = 1;
      
      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });
  }

  return filtered;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    // Parse filters
    const filters: TransactionFilters = {
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
      condition: searchParams.get('condition') || undefined,
      minProfit: searchParams.get('minProfit') ? parseFloat(searchParams.get('minProfit')!) : undefined,
      maxProfit: searchParams.get('maxProfit') ? parseFloat(searchParams.get('maxProfit')!) : undefined,
      sortBy: searchParams.get('sortBy') as any || 'soldDate',
      sortOrder: searchParams.get('sortOrder') as any || 'desc',
      dateRange: searchParams.get('dateStart') || searchParams.get('dateEnd') ? {
        start: searchParams.get('dateStart') ? new Date(searchParams.get('dateStart')!) : new Date(0),
        end: searchParams.get('dateEnd') ? new Date(searchParams.get('dateEnd')!) : new Date(),
      } : undefined,
    };

    // TODO: Replace with actual database queries
    // This would typically:
    // 1. Get user from session/auth
    // 2. Query user's transactions from database
    // 3. Apply filters and pagination
    // 4. Return paginated results

    // Apply filters to mock data
    const filteredTransactions = applyFilters(mockTransactions, filters);
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

    const response = {
      success: true,
      data: {
        data: paginatedTransactions,
        pagination: {
          page,
          limit,
          total: filteredTransactions.length,
          pages: Math.ceil(filteredTransactions.length / limit),
        },
      },
      metadata: {
        filters,
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'TRANSACTIONS_FETCH_ERROR',
          message: 'Failed to fetch transactions',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}