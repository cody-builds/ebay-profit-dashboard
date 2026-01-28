import { NextResponse } from 'next/server';
import { StorageService } from '@/lib/storage/storage-service';

export async function GET() {
  try {
    const startTime = Date.now();
    
    // Test storage service
    const storageService = new StorageService();
    const settings = await storageService.getSettings();
    const transactions = await storageService.getTransactions(undefined, 1, 1);
    
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: '1.0.0',
      services: {
        storage: 'healthy',
        transactions: {
          status: 'healthy',
          count: transactions.pagination.total,
        },
        settings: {
          status: 'healthy',
          configured: !!settings,
          ebayConnected: !!(settings?.ebayTokens?.accessToken),
        },
      },
      performance: {
        responseTime: Date.now() - startTime,
      },
    };

    return NextResponse.json({
      success: true,
      data: healthData,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        status: 'unhealthy',
        error: {
          code: 'HEALTH_CHECK_ERROR',
          message: 'Health check failed',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}