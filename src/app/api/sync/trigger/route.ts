import { NextRequest, NextResponse } from 'next/server';
import { StorageService } from '@/lib/storage/storage-service';
import { EbaySyncService } from '@/lib/ebay/sync-service';
import { z } from 'zod';

// Validation schema for sync request
const SyncRequestSchema = z.object({
  daysBack: z.number().min(1).max(365).optional().default(30),
  force: z.boolean().optional().default(false),
});

// Global sync service instance (in production, use proper dependency injection)
let syncService: EbaySyncService | null = null;

function getSyncService(): EbaySyncService {
  if (!syncService) {
    const storageService = new StorageService();
    syncService = new EbaySyncService(storageService);
  }
  return syncService;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json().catch(() => ({}));
    const { daysBack, force } = SyncRequestSchema.parse(body);

    const syncSvc = getSyncService();

    // Check if already syncing
    if (syncSvc.isSyncing() && !force) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SYNC_IN_PROGRESS',
            message: 'Sync is already in progress. Use force=true to override.',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 409 }
      );
    }

    // Get user settings and validate eBay authentication
    const storageService = new StorageService();
    const settings = await storageService.getSettings();

    if (!settings?.ebayTokens?.accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_AUTHENTICATED',
            message: 'eBay authentication required. Please connect your eBay account.',
            requiresAuth: true,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Check token expiry
    const now = new Date();
    if (now >= settings.ebayTokens.expiresAt) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TOKEN_EXPIRED',
            message: 'eBay token has expired. Please refresh or re-authenticate.',
            requiresAuth: true,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    const syncId = crypto.randomUUID();
    
    // Start sync asynchronously
    syncSvc.syncTransactions(settings.ebayTokens.accessToken, {
      daysBack,
      batchSize: 200,
      maxRetries: 3,
    }).then((result) => {
      console.log('Sync completed:', result);
    }).catch((error) => {
      console.error('Sync failed:', error);
    });

    return NextResponse.json({
      success: true,
      data: {
        syncId,
        status: 'started',
        daysBack,
        message: 'eBay transaction sync started successfully',
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error triggering sync:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request parameters',
            details: error.issues,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SYNC_TRIGGER_ERROR',
          message: 'Failed to trigger sync',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}