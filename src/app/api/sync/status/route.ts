import { NextResponse } from 'next/server';
import { StorageService } from '@/lib/storage/storage-service';
import { EbaySyncService } from '@/lib/ebay/sync-service';
import { createClient } from '@/lib/supabase/server';
import type { NextRequest } from 'next/server';

// Global sync service instance (same as in trigger route)
let syncService: EbaySyncService | null = null;

function getSyncService(): EbaySyncService {
  if (!syncService) {
    const storageService = new StorageService();
    syncService = new EbaySyncService(storageService);
  }
  return syncService;
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication first
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }
    const syncSvc = getSyncService();
    const storageService = new StorageService();
    
    // Get current sync progress
    const syncProgress = syncSvc.getSyncProgress();
    const isActive = syncSvc.isSyncing();
    const lastSyncTime = await storageService.getLastSyncTime();

    // Calculate progress percentage
    const progressPercentage = (syncProgress?.total && syncProgress.total > 0) 
      ? Math.round((syncProgress.processed / syncProgress.total) * 100)
      : 0;

    // Determine current step description
    let currentStep = 'idle';
    if (isActive && syncProgress) {
      switch (syncProgress.status) {
        case 'starting':
          currentStep = 'Initializing sync...';
          break;
        case 'fetching':
          currentStep = `Fetching transactions (Page ${syncProgress.currentPage}/${syncProgress.totalPages})`;
          break;
        case 'processing':
          currentStep = `Processing transactions (${syncProgress.processed}/${syncProgress.total})`;
          break;
        case 'completed':
          currentStep = 'Sync completed';
          break;
        case 'error':
          currentStep = 'Sync encountered errors';
          break;
        default:
          currentStep = 'Syncing...';
      }
    }

    // Estimate completion time based on current progress
    let estimatedCompletion = null;
    if (isActive && syncProgress && syncProgress.processed > 0) {
      const itemsPerSecond = syncProgress.processed / Math.max(1, (Date.now() - Date.now()) / 1000);
      const remainingItems = syncProgress.total - syncProgress.processed;
      const estimatedSeconds = remainingItems / Math.max(itemsPerSecond, 1);
      estimatedCompletion = new Date(Date.now() + estimatedSeconds * 1000).toISOString();
    }

    const response = {
      success: true,
      data: {
        isActive,
        progress: {
          current: syncProgress?.processed || 0,
          total: syncProgress?.total || 0,
          percentage: progressPercentage,
          errors: syncProgress?.errors || 0,
        },
        currentStep,
        status: syncProgress?.status || 'idle',
        pagination: syncProgress ? {
          currentPage: syncProgress.currentPage || 1,
          totalPages: syncProgress.totalPages || 1,
        } : null,
        lastSyncTime: lastSyncTime?.toISOString() || null,
        estimatedCompletion,
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error getting sync status:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SYNC_STATUS_ERROR',
          message: 'Failed to get sync status',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}