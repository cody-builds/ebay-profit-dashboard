import { Transaction, EbayFeeBreakdown, ProfitCalculation } from './types';

/**
 * Calculate eBay fees based on current fee structure (2025)
 */
export function calculateEbayFees(soldPrice: number): EbayFeeBreakdown {
  // eBay Final Value Fee: 13.25% for most categories
  const finalValueFee = soldPrice * 0.1325;
  
  // Payment processing fee: $0.30 per transaction (managed payments)
  const paymentProcessingFee = 0.30;
  
  return {
    finalValueFee: Number(finalValueFee.toFixed(2)),
    paymentProcessingFee,
    total: Number((finalValueFee + paymentProcessingFee).toFixed(2)),
  };
}

/**
 * Calculate net profit for an eBay transaction
 * Formula: Sold Price - eBay Fees - Shipping - Item Cost
 */
export function calculateNetProfit(
  soldPrice: number,
  itemCost: number = 0,
  shippingCost: number = 0,
  ebayFees?: EbayFeeBreakdown
): number {
  const fees = ebayFees || calculateEbayFees(soldPrice);
  const netProfit = soldPrice - fees.total - shippingCost - itemCost;
  return Number(netProfit.toFixed(2));
}

/**
 * Calculate profit margin percentage
 */
export function calculateProfitMargin(
  soldPrice: number,
  itemCost: number = 0,
  shippingCost: number = 0,
  ebayFees?: EbayFeeBreakdown
): number {
  if (soldPrice === 0) return 0;
  
  const netProfit = calculateNetProfit(soldPrice, itemCost, shippingCost, ebayFees);
  const profitMargin = (netProfit / soldPrice) * 100;
  return Number(profitMargin.toFixed(2));
}

/**
 * Calculate days between listing and sale
 */
export function calculateDaysListed(listedDate: Date, soldDate: Date): number {
  const timeDifference = soldDate.getTime() - listedDate.getTime();
  const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
  return Math.max(0, daysDifference);
}

/**
 * Complete profit calculation for a transaction
 */
export function calculateFullProfit(
  soldPrice: number,
  itemCost: number = 0,
  shippingCost: number = 0,
  providedFees?: EbayFeeBreakdown
): ProfitCalculation {
  const ebayFees = providedFees || calculateEbayFees(soldPrice);
  const netProfit = calculateNetProfit(soldPrice, itemCost, shippingCost, ebayFees);
  const profitMargin = calculateProfitMargin(soldPrice, itemCost, shippingCost, ebayFees);

  return {
    soldPrice,
    itemCost,
    ebayFees,
    shippingCost,
    netProfit,
    profitMargin,
    breakdown: {
      soldPrice,
      itemCost,
      ebayFees,
      shippingCost,
      netProfit,
    },
  };
}

/**
 * Update transaction with calculated profit data
 */
export function updateTransactionProfits(transaction: Transaction): Transaction {
  const ebayFees = transaction.ebayFees || calculateEbayFees(transaction.soldPrice);
  const netProfit = calculateNetProfit(
    transaction.soldPrice,
    transaction.itemCost,
    transaction.shippingCost,
    ebayFees
  );
  const profitMargin = calculateProfitMargin(
    transaction.soldPrice,
    transaction.itemCost,
    transaction.shippingCost,
    ebayFees
  );
  const daysListed = calculateDaysListed(transaction.listedDate, transaction.soldDate);

  return {
    ...transaction,
    ebayFees,
    netProfit,
    profitMargin,
    daysListed,
  };
}

// Legacy functions for backward compatibility (will be deprecated)

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Format percentage for display
 */
export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}
