import { Suspense } from 'react';
import { AnalyticsHeader } from '@/components/analytics/AnalyticsHeader';
import { MetricsOverview } from '@/components/analytics/MetricsOverview';
import { ProfitTrendChart } from '@/components/analytics/ProfitTrendChart';
import { CategoryAnalysis } from '@/components/analytics/CategoryAnalysis';
import { ExportControls } from '@/components/analytics/ExportControls';
import { AnalyticsSkeleton } from '@/components/ui/AnalyticsSkeleton';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <AnalyticsHeader />

      <Suspense fallback={<AnalyticsSkeleton />}>
        <AnalyticsContent />
      </Suspense>
    </div>
  );
}

function AnalyticsContent() {
  return (
    <div className="space-y-6">
      {/* Metrics Overview */}
      <MetricsOverview />

      {/* Charts and Analysis */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Profit Trend Chart */}
        <div className="lg:col-span-2">
          <ProfitTrendChart />
        </div>

        {/* Category Analysis */}
        <CategoryAnalysis />

        {/* Export Controls */}
        <ExportControls />
      </div>
    </div>
  );
}