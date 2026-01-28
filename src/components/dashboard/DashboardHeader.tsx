'use client';

import { DollarSign, TrendingUp, ShoppingBag, Target } from 'lucide-react';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { MetricCard, MetricCardSkeleton } from '@/components/ui/MetricCard';

export function DashboardHeader() {
  const { data: metrics, isLoading, error } = useDashboardMetrics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="bg-white rounded-lg border border-red-200 p-6">
        <div className="text-center text-red-600">
          <p className="font-medium">Failed to load dashboard metrics</p>
          <p className="text-sm text-red-500 mt-1">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  const metricCards = [
    {
      title: 'Total Profit',
      value: metrics.totalProfit,
      format: 'currency' as const,
      trend: metrics.trends.profit,
      icon: DollarSign,
      color: 'green' as const,
    },
    {
      title: 'Monthly Profit',
      value: metrics.monthlyProfit,
      format: 'currency' as const,
      trend: metrics.trends.profit,
      icon: TrendingUp,
      color: 'blue' as const,
    },
    {
      title: 'Total Sales',
      value: metrics.totalTransactions,
      format: 'number' as const,
      trend: metrics.trends.transactions,
      icon: ShoppingBag,
      color: 'purple' as const,
    },
    {
      title: 'Avg. Profit Margin',
      value: metrics.profitMargin,
      format: 'percentage' as const,
      trend: metrics.trends.margin,
      icon: Target,
      color: 'orange' as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metricCards.map((metric) => (
        <MetricCard
          key={metric.title}
          title={metric.title}
          value={metric.value}
          format={metric.format}
          trend={metric.trend}
          icon={metric.icon}
          color={metric.color}
        />
      ))}
    </div>
  );
}