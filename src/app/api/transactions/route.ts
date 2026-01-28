import { NextRequest, NextResponse } from 'next/server';
import { TransactionFilters } from '@/lib/types';
import { SupabaseStorageService } from '@/lib/storage/supabase-storage-service';

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
      sortBy: (searchParams.get('sortBy') as 'soldDate' | 'soldPrice' | 'netProfit' | 'profitMargin') || 'soldDate',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
      dateRange: searchParams.get('dateFrom') || searchParams.get('dateTo') ? {
        start: searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : new Date(0),
        end: searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : new Date(),
      } : undefined,
    };

    // Initialize Supabase storage service
    const storageService = new SupabaseStorageService(true); // Server-side

    // Get transactions with filters and pagination
    const result = await storageService.getTransactions(filters, page, limit);

    return NextResponse.json({
      success: true,
      data: result.transactions,
      metadata: {
        pagination: result.pagination,
        filters,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'TRANSACTIONS_FETCH_ERROR',
          message: 'Failed to fetch transactions',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const transactionData = await request.json();
    
    // Initialize Supabase storage service
    const storageService = new SupabaseStorageService(true); // Server-side
    
    // Save the new transaction
    const savedTransaction = await storageService.saveTransaction(transactionData);
    
    return NextResponse.json({
      success: true,
      data: savedTransaction,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'TRANSACTION_CREATE_ERROR',
          message: 'Failed to create transaction',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}