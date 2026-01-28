// Transaction Models
export interface Transaction {
  id: string;
  ebayTransactionId: string;
  ebayItemId: string;
  
  // Sale Information
  title: string;
  soldPrice: number;
  soldDate: Date;
  listedDate: Date;
  
  // Cost Information
  itemCost?: number;
  costUpdatedAt?: Date;
  costUpdatedBy?: string;
  
  // eBay Fees (auto-calculated)
  ebayFees: EbayFeeBreakdown;
  
  // Shipping
  shippingCost: number;
  shippingService: string;
  
  // Calculated Fields
  netProfit: number;
  profitMargin: number;
  daysListed: number;
  
  // Metadata
  category?: string;
  condition?: string;
  notes?: string;
  tags?: string[];
  
  // Sync Information
  syncedAt: Date;
  syncStatus: 'synced' | 'pending' | 'error';
  syncError?: string;
}

export interface EbayFeeBreakdown {
  finalValueFee: number;
  paymentProcessingFee: number;
  insertionFee?: number;
  total: number;
}

// User Settings Models
export interface UserSettings {
  id: string;
  userId: string;
  
  // eBay Integration
  ebayTokens?: {
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
  };
  
  // Sync Settings
  syncFrequency: number;
  autoSync: boolean;
  syncHistoryDays: number;
  
  // Display Preferences
  defaultView: 'dashboard' | 'transactions' | 'analytics';
  currency: 'USD';
  dateFormat: string;
  
  // Calculation Settings
  defaultShippingCost: number;
  roundingPrecision: number;
  
  // Notifications
  emailNotifications: boolean;
  syncFailureAlerts: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

// Filter and Query Types
export interface TransactionFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  minProfit?: number;
  maxProfit?: number;
  category?: string;
  condition?: string;
  search?: string;
  sortBy?: 'soldDate' | 'soldPrice' | 'netProfit' | 'profitMargin';
  sortOrder?: 'asc' | 'desc';
}

// Analytics Types
export interface MonthlyAnalytics {
  totalProfit: number;
  averageProfit: number;
  totalItems: number;
  averageDaysListed: number;
  profitMargin: number;
  totalRevenue: number;
  totalCosts: number;
}

export interface TrendAnalysis {
  profitChange: number;
  volumeChange: number;
  marginChange: number;
  revenueChange: number;
}

export interface CategoryAnalysis {
  category: string;
  totalProfit: number;
  itemCount: number;
  averageProfit: number;
  averageMargin: number;
}

// API Response Types
export interface APIResponse<T> {
  success: true;
  data: T;
  metadata?: {
    pagination?: PaginationInfo;
    filters?: Record<string, unknown>;
    timestamp: string;
  };
}

export interface APIError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    field?: string;
  };
  timestamp: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Profit Calculation Types
export interface ProfitCalculation {
  soldPrice: number;
  itemCost: number;
  ebayFees: EbayFeeBreakdown;
  shippingCost: number;
  netProfit: number;
  profitMargin: number;
  breakdown: {
    soldPrice: number;
    itemCost: number;
    ebayFees: EbayFeeBreakdown;
    shippingCost: number;
    netProfit: number;
  };
}

// eBay API Types
export interface EbayTransaction {
  transactionId: string;
  itemId: string;
  title: string;
  soldPrice: number;
  soldDate: string;
  listedDate: string;
  shippingCost: number;
  category: string;
  condition: string;
  fees: EbayFeeBreakdown;
}

// Sync Types
export interface SyncResult {
  success: boolean;
  newTransactions: number;
  updatedTransactions: number;
  errors: string[];
  syncTime: Date;
}

// Form Types
export interface TransactionFormData {
  title: string;
  soldPrice: number;
  itemCost: number;
  shippingCost: number;
  category?: string;
  condition?: string;
  notes?: string;
  tags?: string[];
}

// Dashboard Types
export interface DashboardMetrics {
  totalProfit: number;
  monthlyProfit: number;
  totalTransactions: number;
  averageProfit: number;
  profitMargin: number;
  topCategory: string;
  trends: {
    profit: number;
    transactions: number;
    margin: number;
  };
}