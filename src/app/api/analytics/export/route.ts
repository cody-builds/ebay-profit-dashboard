import { NextRequest, NextResponse } from 'next/server';
import { Transaction } from '@/lib/types';

// Mock transaction data for export
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
  // Add more mock data as needed
];

function generateCSV(transactions: Transaction[]): string {
  const headers = [
    'Transaction ID',
    'eBay Transaction ID',
    'eBay Item ID',
    'Title',
    'Sold Price',
    'Sold Date',
    'Listed Date',
    'Item Cost',
    'eBay Final Value Fee',
    'Payment Processing Fee',
    'Total eBay Fees',
    'Shipping Cost',
    'Shipping Service',
    'Net Profit',
    'Profit Margin (%)',
    'Days Listed',
    'Category',
    'Condition',
    'Notes',
    'Sync Status',
    'Synced At'
  ];

  const csvRows = [
    headers.join(','),
    ...transactions.map(t => [
      t.id,
      t.ebayTransactionId,
      t.ebayItemId,
      `"${t.title.replace(/"/g, '""')}"`, // Escape quotes in title
      t.soldPrice.toFixed(2),
      t.soldDate.toISOString().split('T')[0],
      t.listedDate.toISOString().split('T')[0],
      t.itemCost?.toFixed(2) || '',
      t.ebayFees.finalValueFee.toFixed(2),
      t.ebayFees.paymentProcessingFee.toFixed(2),
      t.ebayFees.total.toFixed(2),
      t.shippingCost.toFixed(2),
      t.shippingService,
      t.netProfit.toFixed(2),
      t.profitMargin.toFixed(2),
      t.daysListed,
      t.category || '',
      t.condition || '',
      t.notes ? `"${t.notes.replace(/"/g, '""')}"` : '',
      t.syncStatus,
      t.syncedAt.toISOString()
    ].join(','))
  ];

  return csvRows.join('\n');
}

function generateJSON(transactions: Transaction[]): string {
  return JSON.stringify(transactions, null, 2);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    
    // TODO: Implement actual data fetching
    // This would typically:
    // 1. Get user from session/auth
    // 2. Fetch user's transactions from database
    // 3. Apply any filters from query params
    // 4. Generate export file
    
    let content: string;
    let contentType: string;
    let filename: string;
    
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    switch (format.toLowerCase()) {
      case 'json':
        content = generateJSON(mockTransactions);
        contentType = 'application/json';
        filename = `dealflow-transactions-${timestamp}.json`;
        break;
      case 'csv':
      default:
        content = generateCSV(mockTransactions);
        contentType = 'text/csv';
        filename = `dealflow-transactions-${timestamp}.csv`;
        break;
    }

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    });
    
  } catch (error) {
    console.error('Error generating export:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'EXPORT_ERROR',
          message: 'Failed to generate export file',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}