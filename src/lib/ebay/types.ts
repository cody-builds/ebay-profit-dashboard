// eBay API Integration Types

export interface EbayAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  sandbox: boolean;
}

export interface EbayTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  tokenType: string;
}

export interface EbayOAuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface EbayAPIError {
  errorId: number;
  domain: string;
  category: string;
  message: string;
  longMessage?: string;
  severity: string;
}

// eBay Trading API Types
export interface EbayGetSellerTransactionsRequest {
  DetailLevel: 'ReturnAll';
  ModTimeFrom: string; // ISO date string
  ModTimeTo: string;   // ISO date string
  Pagination: {
    EntriesPerPage: number;
    PageNumber: number;
  };
  IncludeFinalValueFee: boolean;
  IncludeContainingOrder: boolean;
}

export interface EbaySellerTransaction {
  TransactionID: string;
  Item: {
    ItemID: string;
    Title: string;
    ListingDetails: {
      StartTime: string;
      EndTime: string;
    };
    PrimaryCategory: {
      CategoryID: string;
      CategoryName: string;
    };
    ConditionID: number;
    ConditionDisplayName: string;
  };
  TransactionPrice: {
    value: number;
    currencyID: string;
  };
  CreatedDate: string;
  PaidTime: string;
  ShippedTime?: string;
  FinalValueFee?: {
    value: number;
    currencyID: string;
  };
  ActualShippingCost?: {
    value: number;
    currencyID: string;
  };
  ShippingServiceSelected?: {
    ShippingService: string;
    ShippingServiceCost: {
      value: number;
      currencyID: string;
    };
  };
  Taxes?: {
    TotalTaxAmount: {
      value: number;
      currencyID: string;
    };
  };
}

export interface EbayGetSellerTransactionsResponse {
  TransactionArray?: {
    Transaction: EbaySellerTransaction[];
  };
  PaginationResult: {
    TotalNumberOfPages: number;
    TotalNumberOfEntries: number;
  };
}

// Internal transaction mapping types
export interface EbayTransactionData {
  transactionId: string;
  itemId: string;
  title: string;
  soldPrice: number;
  soldDate: Date;
  listedDate: Date;
  shippingCost: number;
  shippingService: string;
  category: string;
  condition: string;
  fees: {
    finalValueFee: number;
    paymentProcessingFee: number;
    total: number;
  };
}

export interface SyncProgress {
  total: number;
  processed: number;
  errors: number;
  currentPage: number;
  totalPages: number;
  status: 'starting' | 'fetching' | 'processing' | 'completed' | 'error';
}

export interface SyncOptions {
  daysBack?: number;
  batchSize?: number;
  maxRetries?: number;
}