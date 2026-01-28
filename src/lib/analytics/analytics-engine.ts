import { Transaction, DashboardMetrics, MonthlyAnalytics, TrendAnalysis, CategoryAnalysis } from '../types';

/**
 * Analytics Engine for calculating business metrics and trends
 */
export class AnalyticsEngine {
  /**
   * Calculate dashboard overview metrics
   */
  static calculateDashboardMetrics(transactions: Transaction[]): DashboardMetrics {
    if (transactions.length === 0) {
      return {
        totalProfit: 0,
        monthlyProfit: 0,
        totalTransactions: 0,
        averageProfit: 0,
        profitMargin: 0,
        topCategory: 'No data',
        trends: {
          profit: 0,
          transactions: 0,
          margin: 0,
        },
      };
    }

    // Calculate basic metrics
    const totalProfit = transactions.reduce((sum, t) => sum + t.netProfit, 0);
    const totalTransactions = transactions.length;
    const averageProfit = totalProfit / totalTransactions;
    const totalRevenue = transactions.reduce((sum, t) => sum + t.soldPrice, 0);
    const overallMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    // Calculate monthly profit (current month)
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthTransactions = transactions.filter(t => t.soldDate >= currentMonthStart);
    const monthlyProfit = currentMonthTransactions.reduce((sum, t) => sum + t.netProfit, 0);

    // Find top category by profit
    const categoryProfits = this.calculateCategoryAnalysis(transactions);
    const topCategory = categoryProfits.length > 0 
      ? categoryProfits[0].category 
      : 'No category';

    // Calculate trends (current vs previous month)
    const trends = this.calculateMonthlyTrends(transactions);

    return {
      totalProfit: Number(totalProfit.toFixed(2)),
      monthlyProfit: Number(monthlyProfit.toFixed(2)),
      totalTransactions,
      averageProfit: Number(averageProfit.toFixed(2)),
      profitMargin: Number(overallMargin.toFixed(1)),
      topCategory,
      trends,
    };
  }

  /**
   * Calculate monthly analytics for a specific month
   */
  static calculateMonthlyMetrics(
    transactions: Transaction[],
    year: number,
    month: number
  ): MonthlyAnalytics {
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0);
    
    const monthTransactions = transactions.filter(t => 
      t.soldDate >= monthStart && t.soldDate <= monthEnd
    );

    if (monthTransactions.length === 0) {
      return {
        totalProfit: 0,
        averageProfit: 0,
        totalItems: 0,
        averageDaysListed: 0,
        profitMargin: 0,
        totalRevenue: 0,
        totalCosts: 0,
      };
    }

    const totalProfit = monthTransactions.reduce((sum, t) => sum + t.netProfit, 0);
    const totalRevenue = monthTransactions.reduce((sum, t) => sum + t.soldPrice, 0);
    const totalCosts = monthTransactions.reduce((sum, t) => 
      sum + (t.itemCost || 0) + t.ebayFees.total + t.shippingCost, 0
    );
    const averageProfit = totalProfit / monthTransactions.length;
    const averageDaysListed = monthTransactions.reduce((sum, t) => sum + t.daysListed, 0) / monthTransactions.length;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    return {
      totalProfit: Number(totalProfit.toFixed(2)),
      averageProfit: Number(averageProfit.toFixed(2)),
      totalItems: monthTransactions.length,
      averageDaysListed: Number(averageDaysListed.toFixed(1)),
      profitMargin: Number(profitMargin.toFixed(2)),
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalCosts: Number(totalCosts.toFixed(2)),
    };
  }

  /**
   * Calculate trends comparing current vs previous period
   */
  static calculateTrends(
    current: MonthlyAnalytics,
    previous: MonthlyAnalytics
  ): TrendAnalysis {
    const calculatePercentageChange = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Number((((current - previous) / previous) * 100).toFixed(1));
    };

    return {
      profitChange: calculatePercentageChange(current.totalProfit, previous.totalProfit),
      volumeChange: calculatePercentageChange(current.totalItems, previous.totalItems),
      marginChange: calculatePercentageChange(current.profitMargin, previous.profitMargin),
      revenueChange: calculatePercentageChange(current.totalRevenue, previous.totalRevenue),
    };
  }

  /**
   * Calculate monthly trends for dashboard
   */
  private static calculateMonthlyTrends(transactions: Transaction[]): {
    profit: number;
    transactions: number;
    margin: number;
  } {
    const now = new Date();
    const currentMonth = this.calculateMonthlyMetrics(
      transactions,
      now.getFullYear(),
      now.getMonth() + 1
    );
    
    const previousMonth = this.calculateMonthlyMetrics(
      transactions,
      now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear(),
      now.getMonth() === 0 ? 12 : now.getMonth()
    );

    const trends = this.calculateTrends(currentMonth, previousMonth);

    return {
      profit: trends.profitChange,
      transactions: trends.volumeChange,
      margin: trends.marginChange,
    };
  }

  /**
   * Calculate category analysis
   */
  static calculateCategoryAnalysis(transactions: Transaction[]): CategoryAnalysis[] {
    const categoryMap = new Map<string, Transaction[]>();

    // Group transactions by category
    transactions.forEach(transaction => {
      const category = transaction.category || 'Other';
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category)!.push(transaction);
    });

    // Calculate metrics for each category
    const categoryAnalysis: CategoryAnalysis[] = [];
    categoryMap.forEach((categoryTransactions, category) => {
      const totalProfit = categoryTransactions.reduce((sum, t) => sum + t.netProfit, 0);
      const itemCount = categoryTransactions.length;
      const averageProfit = totalProfit / itemCount;
      const totalRevenue = categoryTransactions.reduce((sum, t) => sum + t.soldPrice, 0);
      const averageMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

      categoryAnalysis.push({
        category,
        totalProfit: Number(totalProfit.toFixed(2)),
        itemCount,
        averageProfit: Number(averageProfit.toFixed(2)),
        averageMargin: Number(averageMargin.toFixed(2)),
      });
    });

    // Sort by total profit descending
    return categoryAnalysis.sort((a, b) => b.totalProfit - a.totalProfit);
  }

  /**
   * Calculate profit by month for trend charts
   */
  static calculateMonthlyProfitTrend(
    transactions: Transaction[],
    monthsBack: number = 12
  ): Array<{ month: string; profit: number; transactions: number; margin: number }> {
    const now = new Date();
    const monthlyData: Array<{ month: string; profit: number; transactions: number; margin: number }> = [];

    for (let i = monthsBack - 1; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth() + 1;
      
      const monthMetrics = this.calculateMonthlyMetrics(transactions, year, month);
      
      monthlyData.push({
        month: targetDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        profit: monthMetrics.totalProfit,
        transactions: monthMetrics.totalItems,
        margin: monthMetrics.profitMargin,
      });
    }

    return monthlyData;
  }

  /**
   * Calculate top performing items
   */
  static getTopPerformingItems(
    transactions: Transaction[],
    limit: number = 10
  ): Transaction[] {
    return transactions
      .slice()
      .sort((a, b) => b.netProfit - a.netProfit)
      .slice(0, limit);
  }

  /**
   * Calculate recent activity summary
   */
  static getRecentActivity(
    transactions: Transaction[],
    days: number = 7
  ): {
    recentSales: number;
    recentProfit: number;
    avgDaysToSell: number;
    bestSale: Transaction | null;
  } {
    const cutoffDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
    const recentTransactions = transactions.filter(t => t.soldDate >= cutoffDate);

    if (recentTransactions.length === 0) {
      return {
        recentSales: 0,
        recentProfit: 0,
        avgDaysToSell: 0,
        bestSale: null,
      };
    }

    const recentProfit = recentTransactions.reduce((sum, t) => sum + t.netProfit, 0);
    const avgDaysToSell = recentTransactions.reduce((sum, t) => sum + t.daysListed, 0) / recentTransactions.length;
    const bestSale = recentTransactions.reduce((best, current) => 
      current.netProfit > best.netProfit ? current : best
    );

    return {
      recentSales: recentTransactions.length,
      recentProfit: Number(recentProfit.toFixed(2)),
      avgDaysToSell: Number(avgDaysToSell.toFixed(1)),
      bestSale,
    };
  }
}