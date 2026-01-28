import { DEFAULT_FEES, FeeStructure, ArbitrageOpportunity, CardListing } from './types';

// Re-export for convenience
export { DEFAULT_FEES } from './types';

/**
 * Calculate eBay fees for a sale
 */
export function calculateEbayFees(salePrice: number, fees: FeeStructure = DEFAULT_FEES): number {
  // eBay Final Value Fee (13.25% for trading cards category)
  const finalValueFee = salePrice * fees.ebayFinalValuePercent;
  
  // eBay per-transaction fee
  const transactionFee = fees.ebayTransactionFee;
  
  return finalValueFee + transactionFee;
}

/**
 * Calculate payment processing fees (PayPal/Managed Payments)
 * Currently returns 0 as eBay Managed Payments includes this
 */
export function calculatePaymentFees(): number {
  // eBay Managed Payments is included in final value fee now
  // But if using PayPal directly: 3.49% + $0.49
  // For most sellers, this is baked into eBay's managed payments
  return 0; // Managed payments included in eBay fee
}

/**
 * Calculate total fees for an eBay sale
 */
export function calculateTotalFees(
  salePrice: number, 
  shippingCost: number = DEFAULT_FEES.estimatedShipping,
  fees: FeeStructure = DEFAULT_FEES
): { ebayFees: number; paymentFees: number; shippingCost: number; totalFees: number } {
  const ebayFees = calculateEbayFees(salePrice, fees);
  const paymentFees = calculatePaymentFees();
  
  return {
    ebayFees,
    paymentFees,
    shippingCost,
    totalFees: ebayFees + paymentFees + shippingCost,
  };
}

/**
 * Calculate net profit from an arbitrage opportunity
 */
export function calculateProfit(
  buyPrice: number,
  buyShipping: number,
  sellPrice: number,
  fees: FeeStructure = DEFAULT_FEES
): { 
  totalBuyCost: number;
  grossProfit: number;
  ebayFees: number;
  paymentFees: number;
  shippingCost: number;
  netProfit: number;
  roi: number;
  profitMargin: number;
} {
  const totalBuyCost = buyPrice + buyShipping;
  const feeBreakdown = calculateTotalFees(sellPrice, fees.estimatedShipping, fees);
  
  const grossProfit = sellPrice - totalBuyCost;
  const netProfit = grossProfit - feeBreakdown.totalFees;
  
  // ROI = (Net Profit / Total Investment) * 100
  const roi = totalBuyCost > 0 ? (netProfit / totalBuyCost) * 100 : 0;
  
  // Profit Margin = (Net Profit / Sale Price) * 100
  const profitMargin = sellPrice > 0 ? (netProfit / sellPrice) * 100 : 0;
  
  return {
    totalBuyCost,
    grossProfit,
    ebayFees: feeBreakdown.ebayFees,
    paymentFees: feeBreakdown.paymentFees,
    shippingCost: feeBreakdown.shippingCost,
    netProfit,
    roi,
    profitMargin,
  };
}

/**
 * Assess risk level of an arbitrage opportunity
 */
export function assessRisk(
  recentSalesCount: number,
  priceVolatility: number, // Standard deviation as percentage of mean
  daysSinceLastSale: number
): { riskLevel: 'low' | 'medium' | 'high'; confidence: number } {
  let riskScore = 0;
  
  // Sales volume risk (more sales = lower risk)
  if (recentSalesCount < 3) riskScore += 30;
  else if (recentSalesCount < 10) riskScore += 15;
  else riskScore += 5;
  
  // Price volatility risk
  if (priceVolatility > 30) riskScore += 30;
  else if (priceVolatility > 15) riskScore += 15;
  else riskScore += 5;
  
  // Recency risk (older data = higher risk)
  if (daysSinceLastSale > 30) riskScore += 30;
  else if (daysSinceLastSale > 14) riskScore += 15;
  else riskScore += 5;
  
  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high';
  if (riskScore <= 30) riskLevel = 'low';
  else if (riskScore <= 60) riskLevel = 'medium';
  else riskLevel = 'high';
  
  // Confidence is inverse of risk
  const confidence = Math.max(0, Math.min(100, 100 - riskScore));
  
  return { riskLevel, confidence };
}

/**
 * Create a full arbitrage opportunity from card data
 */
export function createArbitrageOpportunity(
  card: CardListing,
  tcgPrice: number,
  tcgShipping: number,
  ebayAvgSold: number,
  ebayLowSold: number,
  ebayHighSold: number,
  recentSalesCount: number,
  fees: FeeStructure = DEFAULT_FEES
): ArbitrageOpportunity {
  // Use average sold price as estimated sale price
  const estimatedSalePrice = ebayAvgSold;
  
  const profitCalc = calculateProfit(tcgPrice, tcgShipping, estimatedSalePrice, fees);
  
  // Calculate price volatility
  const priceRange = ebayHighSold - ebayLowSold;
  const priceVolatility = ebayAvgSold > 0 ? (priceRange / ebayAvgSold) * 100 : 50;
  
  const { riskLevel, confidence } = assessRisk(recentSalesCount, priceVolatility, 0);
  
  return {
    id: `${card.id}-${Date.now()}`,
    card,
    tcgPrice,
    tcgShipping,
    ebayAvgSold,
    ebayLowSold,
    ebayHighSold,
    recentSalesCount,
    
    totalBuyCost: profitCalc.totalBuyCost,
    estimatedSalePrice,
    ebayFees: profitCalc.ebayFees,
    paypalFees: profitCalc.paymentFees,
    estimatedShipping: profitCalc.shippingCost,
    netProfit: profitCalc.netProfit,
    roi: profitCalc.roi,
    profitMargin: profitCalc.profitMargin,
    
    riskLevel,
    confidence,
    
    createdAt: new Date(),
  };
}

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
