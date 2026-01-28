import { Transaction, ProfitCalculation, EbayFeeBreakdown } from './types';

/**
 * Calculate eBay fees for a given sale price
 */
export function calculateEbayFees(soldPrice: number, category: string = 'Trading Cards'): EbayFeeBreakdown {
  // Trading Cards category has 13.25% FVF + $0.30 transaction fee
  // Different categories may have different rates
  
  let fvfRate = 0.1325; // 13.25% for Trading Cards
  
  // Adjust rate based on category (add more categories as needed)
  switch (category.toLowerCase()) {
    case 'trading cards':
    case 'collectible card games':
      fvfRate = 0.1325;
      break;
    case 'electronics':
      fvfRate = 0.1225; // 12.25%
      break;
    case 'books':
      fvfRate = 0.1455; // 14.55%
      break;
    default:
      fvfRate = 0.1325; // Default to 13.25%
  }

  const finalValueFee = soldPrice * fvfRate;
  const paymentProcessingFee = 0.30;
  const insertionFee = 0; // Most listings are free
  
  return {
    finalValueFee: Number(finalValueFee.toFixed(2)),
    paymentProcessingFee,
    insertionFee,
    total: Number((finalValueFee + paymentProcessingFee + insertionFee).toFixed(2)),
  };
}

/**
 * Calculate complete profit breakdown for a transaction
 */
export function calculateProfit(
  soldPrice: number,
  itemCost: number = 0,
  shippingCost: number = 0,
  category: string = 'Trading Cards'
): ProfitCalculation {
  const ebayFees = calculateEbayFees(soldPrice, category);
  const netProfit = soldPrice - itemCost - ebayFees.total - shippingCost;
  const profitMargin = soldPrice > 0 ? (netProfit / soldPrice) * 100 : 0;

  return {
    soldPrice,
    itemCost,
    ebayFees,
    shippingCost,
    netProfit: Number(netProfit.toFixed(2)),
    profitMargin: Number(profitMargin.toFixed(2)),
    breakdown: {
      soldPrice,
      itemCost,
      ebayFees,
      shippingCost,
      netProfit: Number(netProfit.toFixed(2)),
    },
  };
}

/**
 * Update a transaction with recalculated profits
 */
export function updateTransactionProfits(transaction: Transaction): Transaction {
  const profitCalc = calculateProfit(
    transaction.soldPrice,
    transaction.itemCost || 0,
    transaction.shippingCost,
    transaction.category
  );

  return {
    ...transaction,
    ebayFees: profitCalc.ebayFees,
    netProfit: profitCalc.netProfit,
    profitMargin: profitCalc.profitMargin,
  };
}

/**
 * Calculate average listing length from a date range
 */
export function calculateListingLength(listedDate: Date, soldDate: Date): number {
  const timeDiff = soldDate.getTime() - listedDate.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  return Math.max(0, daysDiff); // Ensure non-negative
}

/**
 * Calculate average metrics for multiple transactions
 */
export function calculateAverageMetrics(transactions: Transaction[]): {
  averageProfit: number;
  averageMargin: number;
  averageListingDays: number;
  totalProfit: number;
  totalRevenue: number;
} {
  if (transactions.length === 0) {
    return {
      averageProfit: 0,
      averageMargin: 0,
      averageListingDays: 0,
      totalProfit: 0,
      totalRevenue: 0,
    };
  }

  const totalProfit = transactions.reduce((sum, t) => sum + t.netProfit, 0);
  const totalRevenue = transactions.reduce((sum, t) => sum + t.soldPrice, 0);
  const totalMargin = transactions.reduce((sum, t) => sum + t.profitMargin, 0);
  const totalListingDays = transactions.reduce((sum, t) => sum + t.daysListed, 0);

  return {
    averageProfit: Number((totalProfit / transactions.length).toFixed(2)),
    averageMargin: Number((totalMargin / transactions.length).toFixed(2)),
    averageListingDays: Number((totalListingDays / transactions.length).toFixed(1)),
    totalProfit: Number(totalProfit.toFixed(2)),
    totalRevenue: Number(totalRevenue.toFixed(2)),
  };
}

/**
 * Calculate profit trends between two periods
 */
export function calculateTrends(
  currentPeriodTransactions: Transaction[],
  previousPeriodTransactions: Transaction[]
): {
  profitChange: number;
  volumeChange: number;
  marginChange: number;
  revenueChange: number;
} {
  const current = calculateAverageMetrics(currentPeriodTransactions);
  const previous = calculateAverageMetrics(previousPeriodTransactions);

  const calculatePercentChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Number((((current - previous) / previous) * 100).toFixed(2));
  };

  return {
    profitChange: calculatePercentChange(current.totalProfit, previous.totalProfit),
    volumeChange: calculatePercentChange(currentPeriodTransactions.length, previousPeriodTransactions.length),
    marginChange: calculatePercentChange(current.averageMargin, previous.averageMargin),
    revenueChange: calculatePercentChange(current.totalRevenue, previous.totalRevenue),
  };
}