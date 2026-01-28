import { NextResponse } from 'next/server';
import { DashboardMetrics } from '@/lib/types';
import { SupabaseStorageService } from '@/lib/storage/supabase-storage-service';

export async function GET() {
  try {
    const storageService = new SupabaseStorageService(true); // Server-side

    // Calculate date ranges for current and previous periods
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Get current period analytics
    const currentPeriodAnalytics = await storageService.getAnalytics(thirtyDaysAgo, now);
    
    // Get previous period analytics for trend calculation
    const previousPeriodAnalytics = await storageService.getAnalytics(sixtyDaysAgo, thirtyDaysAgo);

    // Get all-time analytics
    const allTimeStartDate = new Date(2020, 0, 1); // Start from 2020
    const allTimeAnalytics = await storageService.getAnalytics(allTimeStartDate, now);

    // Calculate trends
    const profitTrend = previousPeriodAnalytics.totalProfit > 0 
      ? ((currentPeriodAnalytics.totalProfit - previousPeriodAnalytics.totalProfit) / previousPeriodAnalytics.totalProfit) * 100
      : 0;

    const transactionsTrend = previousPeriodAnalytics.totalTransactions > 0
      ? ((currentPeriodAnalytics.totalTransactions - previousPeriodAnalytics.totalTransactions) / previousPeriodAnalytics.totalTransactions) * 100
      : 0;

    const marginTrend = previousPeriodAnalytics.averageMargin > 0
      ? currentPeriodAnalytics.averageMargin - previousPeriodAnalytics.averageMargin
      : 0;

    // Determine top category
    const topCategory = allTimeAnalytics.topCategories.length > 0 
      ? allTimeAnalytics.topCategories[0].category 
      : 'No data';

    const dashboardMetrics: DashboardMetrics = {
      totalProfit: allTimeAnalytics.totalProfit,
      monthlyProfit: currentPeriodAnalytics.totalProfit,
      totalTransactions: allTimeAnalytics.totalTransactions,
      averageProfit: allTimeAnalytics.averageProfit,
      profitMargin: allTimeAnalytics.averageMargin,
      topCategory,
      trends: {
        profit: Number(profitTrend.toFixed(1)),
        transactions: Number(transactionsTrend.toFixed(1)),
        margin: Number(marginTrend.toFixed(1)),
      },
    };

    return NextResponse.json({
      success: true,
      data: dashboardMetrics,
      metadata: {
        timestamp: new Date().toISOString(),
        periodDays: 30,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'METRICS_FETCH_ERROR',
          message: 'Failed to fetch dashboard metrics',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}