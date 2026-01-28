# Technical Architecture Document
## DealFlow - eBay Profit Dashboard

**Version:** 1.0  
**Date:** January 28, 2026  
**Technical Lead:** Claire's Development Team  
**Project:** Personal eBay Profit Dashboard  

---

## 1. Executive Summary

### Architecture Overview
The DealFlow application is built as a modern, scalable web application following Next.js 14 App Router patterns with a focus on performance, security, and maintainability. The architecture is designed to handle eBay API integration, real-time data processing, and comprehensive profit analytics while maintaining enterprise-grade reliability.

### Key Architectural Decisions
- **Framework**: Next.js 14 with App Router for optimal performance and developer experience
- **Full-Stack Approach**: API routes for backend logic, eliminating the need for separate backend service
- **Data Strategy**: Hybrid approach - eBay API integration with local caching for performance
- **State Management**: Modern React patterns with Zustand for global state, TanStack Query for server state
- **Security-First**: Comprehensive security implementation with rate limiting, input validation, and secure API handling

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend Layer                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  Dashboard  │  │Transactions │  │  Analytics  │     │
│  │    Page     │  │    Page     │  │    Page     │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────┐
│                    API Routes Layer                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │    eBay     │  │Transactions │  │  Analytics  │     │
│  │    Sync     │  │     API     │  │     API     │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────┐
│                   Services Layer                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │    eBay     │  │   Profit    │  │   Cache     │     │
│  │  Connector  │  │ Calculator  │  │  Manager    │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────┐
│                   Data Layer                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │    Local    │  │    eBay     │  │   Browser   │     │
│  │   Storage   │  │     API     │  │   Storage   │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Component Architecture

```
src/
├── app/                           # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/
│   │   └── callback/
│   ├── (dashboard)/              # Main application routes
│   │   ├── page.tsx             # Dashboard overview
│   │   ├── transactions/        # Transaction management
│   │   ├── analytics/           # Business intelligence
│   │   └── settings/            # User preferences
│   └── api/                     # Backend API routes
│       ├── auth/                # eBay OAuth handling
│       ├── sync/                # eBay data synchronization
│       ├── transactions/        # Transaction CRUD operations
│       ├── analytics/           # Business intelligence APIs
│       └── health/              # System health checks
├── components/                   # Reusable UI components
│   ├── ui/                      # Base UI components
│   ├── forms/                   # Form components
│   ├── charts/                  # Analytics visualizations
│   └── layouts/                 # Layout components
├── lib/                         # Core business logic
│   ├── ebay/                    # eBay API integration
│   ├── calculations/            # Profit calculations
│   ├── validation/              # Input validation schemas
│   └── utils/                   # Utility functions
├── hooks/                       # Custom React hooks
├── store/                       # State management
└── types/                       # TypeScript definitions
```

---

## 3. Data Architecture

### 3.1 Data Models

#### Transaction Model
```typescript
interface Transaction {
  id: string;                    // Internal transaction ID
  ebayTransactionId: string;     // eBay transaction identifier
  ebayItemId: string;           // eBay item identifier
  
  // Sale Information
  title: string;                // Item title/description
  soldPrice: number;            // Final sale price
  soldDate: Date;              // Date of sale
  listedDate: Date;            // Date item was listed
  
  // Cost Information
  itemCost?: number;           // Manual cost input (optional)
  costUpdatedAt?: Date;        // Last cost update timestamp
  costUpdatedBy?: string;      // Cost update source
  
  // eBay Fees (auto-calculated)
  ebayFees: {
    finalValueFee: number;     // eBay final value fee
    paymentProcessingFee: number; // Payment processing fee
    insertionFee?: number;     // Listing insertion fee
    total: number;             // Total eBay fees
  };
  
  // Shipping
  shippingCost: number;        // Shipping cost charged to buyer
  shippingService: string;     // Shipping service used
  
  // Calculated Fields
  netProfit: number;           // Auto-calculated net profit
  profitMargin: number;        // Profit margin percentage
  daysListed: number;          // Days from listing to sale
  
  // Metadata
  category?: string;           // eBay category
  condition?: string;          // Item condition
  notes?: string;              // User notes
  tags?: string[];            // User tags
  
  // Sync Information
  syncedAt: Date;             // Last sync from eBay
  syncStatus: 'synced' | 'pending' | 'error';
  syncError?: string;         // Sync error message if any
}
```

#### User Settings Model
```typescript
interface UserSettings {
  id: string;
  userId: string;
  
  // eBay Integration
  ebayTokens?: {
    accessToken: string;       // Encrypted eBay access token
    refreshToken: string;      // Encrypted eBay refresh token
    expiresAt: Date;          // Token expiration
  };
  
  // Sync Settings
  syncFrequency: number;      // Hours between syncs (default: 6)
  autoSync: boolean;          // Enable automatic sync
  syncHistoryDays: number;    // Days of history to sync (default: 90)
  
  // Display Preferences
  defaultView: 'dashboard' | 'transactions' | 'analytics';
  currency: 'USD';            // Currently only USD
  dateFormat: string;         // Date display format
  
  // Calculation Settings
  defaultShippingCost: number; // Default shipping if not specified
  roundingPrecision: number;   // Decimal places for currency
  
  // Notifications
  emailNotifications: boolean;
  syncFailureAlerts: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}
```

### 3.2 Data Flow Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    eBay     │───▶│   Sync      │───▶│   Local     │
│     API     │    │  Service    │    │   Cache     │
└─────────────┘    └─────────────┘    └─────────────┘
                           │                   │
┌─────────────┐           │          ┌─────────────┐
│   Manual    │───────────┼─────────▶│   Profit    │
│   Costs     │           │          │ Calculator  │
└─────────────┘           ▼          └─────────────┘
                   ┌─────────────┐           │
                   │ Transaction │           ▼
                   │   Storage   │    ┌─────────────┐
                   └─────────────┘    │     UI      │
                           │          │  Dashboard  │
                           ▼          └─────────────┘
                   ┌─────────────┐
                   │  Analytics  │
                   │   Engine    │
                   └─────────────┘
```

---

## 4. API Architecture

### 4.1 API Design Principles
- **RESTful Design**: Clear, predictable URL structure
- **TypeScript First**: Full type safety across API boundaries
- **Error Handling**: Comprehensive error responses with actionable information
- **Rate Limiting**: Protect against abuse and eBay API limits
- **Input Validation**: Zod schemas for all API inputs
- **Authentication**: Secure eBay OAuth integration

### 4.2 API Endpoints Specification

#### Authentication Endpoints
```typescript
// eBay OAuth Flow
GET  /api/auth/ebay/login          // Initiate eBay OAuth
GET  /api/auth/ebay/callback       // Handle OAuth callback
POST /api/auth/ebay/refresh        // Refresh expired tokens
GET  /api/auth/status              // Check authentication status
```

#### Sync & Data Management
```typescript
// eBay Data Synchronization
POST /api/sync/trigger             // Manual sync trigger
GET  /api/sync/status              // Sync status and progress
GET  /api/sync/history             // Sync history and logs

// Transaction Management
GET    /api/transactions           // List transactions (paginated)
GET    /api/transactions/:id       // Get single transaction
PATCH  /api/transactions/:id       // Update transaction (costs/notes)
DELETE /api/transactions/:id       // Delete transaction
POST   /api/transactions/bulk      // Bulk operations
```

#### Analytics & Reporting
```typescript
// Business Intelligence
GET  /api/analytics/overview       // Dashboard metrics
GET  /api/analytics/monthly        // Monthly profit reports
GET  /api/analytics/trends         // Profit trends over time
GET  /api/analytics/categories     // Category performance
GET  /api/analytics/export         // Export data (CSV/JSON)
```

#### System Endpoints
```typescript
// Health & Monitoring
GET  /api/health                   // Application health check
GET  /api/status                   // Detailed system status
POST /api/feedback                 // User feedback collection
```

### 4.3 API Response Standards

#### Success Response Format
```typescript
interface APIResponse<T> {
  success: true;
  data: T;
  metadata?: {
    pagination?: PaginationInfo;
    filters?: FilterInfo;
    timestamp: string;
  };
}
```

#### Error Response Format
```typescript
interface APIError {
  success: false;
  error: {
    code: string;                  // Error code (e.g., "INVALID_INPUT")
    message: string;               // Human-readable message
    details?: Record<string, any>; // Additional error context
    field?: string;                // Field causing validation error
  };
  timestamp: string;
}
```

---

## 5. Frontend Architecture

### 5.1 Component Strategy

#### Design System Components
```typescript
// Base UI Components (src/components/ui/)
- Button, Input, Select, Card, Modal, Toast
- Form components with validation
- Loading states and skeletons
- Error boundaries

// Business Logic Components (src/components/)
- TransactionCard: Display individual transactions
- ProfitCalculator: Real-time profit calculations
- SyncStatus: eBay sync status indicator  
- AnalyticsChart: Data visualization
- CostEditor: Inline cost editing interface
```

#### Page Components Architecture
```typescript
// Dashboard Page (app/page.tsx)
├── DashboardHeader        // Key metrics summary
├── RecentTransactions     // Latest sales preview
├── QuickActions          // Common user actions
└── SyncStatusWidget      // eBay sync information

// Transactions Page (app/transactions/page.tsx)  
├── TransactionFilters    // Search and filter controls
├── TransactionList       // Paginated transaction display
│   └── TransactionCard   // Individual transaction item
├── BulkActions          // Multi-select operations
└── PaginationControls   // List navigation

// Analytics Page (app/analytics/page.tsx)
├── MetricsOverview      // High-level KPIs
├── ProfitTrendChart     // Historical profit visualization
├── CategoryAnalysis     // Performance by category
└── ExportControls       // Data export options
```

### 5.2 State Management Strategy

#### Global State (Zustand)
```typescript
// Auth Store
interface AuthState {
  isAuthenticated: boolean;
  ebayConnected: boolean;
  user: UserProfile | null;
  login: () => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

// App State Store  
interface AppState {
  syncStatus: SyncStatus;
  lastSyncTime: Date | null;
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  clearNotifications: () => void;
}

// UI State Store
interface UIState {
  sidebarOpen: boolean;
  currentView: string;
  filters: TransactionFilters;
  updateFilters: (filters: Partial<TransactionFilters>) => void;
}
```

#### Server State (TanStack Query)
```typescript
// Transaction Queries
const useTransactions = (filters?: TransactionFilters) => {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => fetchTransactions(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Analytics Queries
const useAnalytics = (period: string) => {
  return useQuery({
    queryKey: ['analytics', period],
    queryFn: () => fetchAnalytics(period),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Sync Status Query (Real-time)
const useSyncStatus = () => {
  return useQuery({
    queryKey: ['sync-status'],
    queryFn: fetchSyncStatus,
    refetchInterval: 30000, // 30 seconds during sync
  });
};
```

### 5.3 Performance Architecture

#### Code Splitting Strategy
```typescript
// Route-based splitting (automatic with App Router)
const DashboardPage = lazy(() => import('./dashboard/page'));
const TransactionsPage = lazy(() => import('./transactions/page'));
const AnalyticsPage = lazy(() => import('./analytics/page'));

// Component-based splitting for heavy components
const AnalyticsChart = lazy(() => import('./AnalyticsChart'));
const CostBulkEditor = lazy(() => import('./CostBulkEditor'));
```

#### Caching Strategy
- **Browser Cache**: Static assets (24h TTL)
- **API Cache**: TanStack Query with smart invalidation
- **Local Storage**: User preferences and draft data
- **Session Storage**: Temporary form data and navigation state

---

## 6. Backend Architecture

### 6.1 eBay Integration Architecture

#### eBay API Wrapper Service
```typescript
class EbayAPIService {
  private client: EbayAuthClient;
  
  // Authentication Management
  async refreshAccessToken(): Promise<EbayTokens>;
  async validateToken(): Promise<boolean>;
  
  // Transaction Data Fetching
  async getSellingTransactions(params: GetTransactionsParams): Promise<EbayTransaction[]>;
  async getItemDetails(itemId: string): Promise<EbayItemDetails>;
  async getSellerFees(transactionId: string): Promise<EbayFees>;
  
  // Sync Management
  async syncTransactions(lastSyncTime?: Date): Promise<SyncResult>;
  async validateSyncIntegrity(): Promise<ValidationResult>;
}
```

#### Rate Limiting & Error Handling
```typescript
// eBay API Rate Limiter
class EbayRateLimiter {
  private dailyCallCount: number = 0;
  private readonly DAILY_LIMIT = 5000;
  
  async executeWithRateLimit<T>(
    operation: () => Promise<T>
  ): Promise<T>;
  
  async waitForRateLimit(): Promise<void>;
  resetDailyCounter(): void;
}

// Error Recovery Strategy
class EbaySyncService {
  async syncWithRetry(maxRetries: number = 3): Promise<SyncResult>;
  async handlePartialFailure(failedItems: string[]): Promise<void>;
  async scheduleRetrySync(delay: number): Promise<void>;
}
```

### 6.2 Business Logic Architecture

#### Profit Calculation Engine
```typescript
class ProfitCalculator {
  // Core calculation method
  static calculateNetProfit(transaction: TransactionInput): ProfitResult {
    const ebayFees = this.calculateEbayFees(transaction.soldPrice);
    const totalCosts = transaction.itemCost + 
                      ebayFees.total + 
                      transaction.shippingCost;
    
    return {
      netProfit: transaction.soldPrice - totalCosts,
      profitMargin: ((transaction.soldPrice - totalCosts) / transaction.soldPrice) * 100,
      breakdown: {
        soldPrice: transaction.soldPrice,
        itemCost: transaction.itemCost,
        ebayFees: ebayFees,
        shippingCost: transaction.shippingCost,
        netProfit: transaction.soldPrice - totalCosts
      }
    };
  }
  
  // eBay fee calculation based on current fee structure
  static calculateEbayFees(soldPrice: number): EbayFeeBreakdown {
    const finalValueFee = soldPrice * 0.1325; // 13.25%
    const paymentProcessingFee = 0.30;         // $0.30 per transaction
    
    return {
      finalValueFee,
      paymentProcessingFee,
      total: finalValueFee + paymentProcessingFee
    };
  }
}
```

#### Analytics Engine
```typescript
class AnalyticsEngine {
  // Monthly profit analysis
  static calculateMonthlyMetrics(transactions: Transaction[]): MonthlyAnalytics {
    return {
      totalProfit: sum(transactions.map(t => t.netProfit)),
      averageProfit: average(transactions.map(t => t.netProfit)),
      totalItems: transactions.length,
      averageDaysListed: average(transactions.map(t => t.daysListed)),
      profitMargin: this.calculateOverallMargin(transactions),
    };
  }
  
  // Trend analysis
  static calculateTrends(
    current: MonthlyAnalytics, 
    previous: MonthlyAnalytics
  ): TrendAnalysis {
    return {
      profitChange: this.calculatePercentageChange(current.totalProfit, previous.totalProfit),
      volumeChange: this.calculatePercentageChange(current.totalItems, previous.totalItems),
      marginChange: this.calculatePercentageChange(current.profitMargin, previous.profitMargin),
    };
  }
}
```

### 6.3 Data Persistence Architecture

#### Storage Strategy
```typescript
// Local Storage Manager (Browser-based for MVP)
class LocalStorageManager {
  private readonly STORAGE_KEY = 'dealflow_data';
  
  // Transaction storage
  async saveTransaction(transaction: Transaction): Promise<void>;
  async getTransactions(filters?: TransactionFilters): Promise<Transaction[]>;
  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<void>;
  async deleteTransaction(id: string): Promise<void>;
  
  // Settings storage
  async saveSettings(settings: UserSettings): Promise<void>;
  async getSettings(): Promise<UserSettings>;
  
  // Cache management
  async clearCache(): Promise<void>;
  async exportData(): Promise<ExportData>;
}
```

#### Data Validation & Integrity
```typescript
// Zod schemas for data validation
const TransactionSchema = z.object({
  id: z.string().uuid(),
  ebayTransactionId: z.string(),
  title: z.string().min(1),
  soldPrice: z.number().positive(),
  soldDate: z.date(),
  listedDate: z.date(),
  itemCost: z.number().min(0).optional(),
  // ... other fields
});

// Validation service
class ValidationService {
  static validateTransaction(data: unknown): ValidationResult<Transaction> {
    const result = TransactionSchema.safeParse(data);
    return {
      success: result.success,
      data: result.success ? result.data : null,
      errors: result.success ? null : result.error.errors
    };
  }
}
```

---

## 7. Security Architecture

### 7.1 Authentication & Authorization

#### eBay OAuth 2.0 Integration
```typescript
class EbayAuthService {
  // OAuth flow initiation
  generateAuthURL(): string {
    const params = new URLSearchParams({
      client_id: process.env.EBAY_CLIENT_ID,
      response_type: 'code',
      redirect_uri: process.env.EBAY_REDIRECT_URI,
      scope: 'https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.marketing.readonly',
      state: generateSecureState()
    });
    
    return `https://auth.ebay.com/oauth2/authorize?${params}`;
  }
  
  // Token exchange
  async exchangeCodeForTokens(code: string, state: string): Promise<EbayTokens> {
    // Validate state parameter
    if (!this.validateState(state)) {
      throw new Error('Invalid OAuth state');
    }
    
    // Exchange code for tokens
    const tokens = await this.requestTokens(code);
    
    // Encrypt tokens before storage
    return this.encryptTokens(tokens);
  }
}
```

#### Token Security
```typescript
class TokenManager {
  private readonly ENCRYPTION_KEY = process.env.TOKEN_ENCRYPTION_KEY;
  
  // Secure token storage
  async encryptAndStore(tokens: EbayTokens): Promise<string> {
    const encrypted = await encrypt(JSON.stringify(tokens), this.ENCRYPTION_KEY);
    return base64Encode(encrypted);
  }
  
  // Secure token retrieval
  async retrieveAndDecrypt(encryptedTokens: string): Promise<EbayTokens> {
    const decrypted = await decrypt(base64Decode(encryptedTokens), this.ENCRYPTION_KEY);
    return JSON.parse(decrypted);
  }
  
  // Token refresh with error handling
  async refreshTokens(refreshToken: string): Promise<EbayTokens> {
    try {
      const newTokens = await this.ebayAPI.refreshAccessToken(refreshToken);
      return await this.encryptAndStore(newTokens);
    } catch (error) {
      // Log error and trigger re-authentication
      console.error('Token refresh failed:', error);
      throw new AuthenticationError('Re-authentication required');
    }
  }
}
```

### 7.2 API Security

#### Input Validation & Sanitization
```typescript
// API middleware for validation
export function validateInput<T>(schema: z.ZodSchema<T>) {
  return async (req: NextRequest) => {
    try {
      const body = await req.json();
      const validatedData = schema.parse(body);
      return validatedData;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              code: 'VALIDATION_ERROR',
              message: 'Invalid input data',
              details: error.errors
            }
          },
          { status: 400 }
        );
      }
      throw error;
    }
  };
}
```

#### Rate Limiting Implementation
```typescript
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  async checkRateLimit(
    identifier: string, 
    maxRequests: number, 
    windowMs: number
  ): Promise<boolean> {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Get existing requests for this identifier
    const userRequests = this.requests.get(identifier) || [];
    
    // Filter out requests outside the current window
    const recentRequests = userRequests.filter(time => time > windowStart);
    
    // Check if limit exceeded
    if (recentRequests.length >= maxRequests) {
      return false;
    }
    
    // Add current request
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);
    
    return true;
  }
}
```

### 7.3 Data Protection

#### Environment Variable Security
```typescript
// Environment validation schema
const EnvironmentSchema = z.object({
  EBAY_CLIENT_ID: z.string().min(1),
  EBAY_CLIENT_SECRET: z.string().min(1),
  EBAY_REDIRECT_URI: z.string().url(),
  TOKEN_ENCRYPTION_KEY: z.string().min(32),
  API_RATE_LIMIT_MAX: z.string().transform(Number),
  API_RATE_LIMIT_WINDOW_MS: z.string().transform(Number),
});

// Validate environment on startup
export const env = EnvironmentSchema.parse(process.env);
```

#### Secure Data Handling
```typescript
class DataProtectionService {
  // Sanitize user inputs
  static sanitizeInput(input: string): string {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .trim();
  }
  
  // Redact sensitive data from logs
  static redactSensitiveData(data: any): any {
    const sensitiveFields = ['accessToken', 'refreshToken', 'clientSecret'];
    const redacted = { ...data };
    
    sensitiveFields.forEach(field => {
      if (field in redacted) {
        redacted[field] = '[REDACTED]';
      }
    });
    
    return redacted;
  }
}
```

---

## 8. Performance Architecture

### 8.1 Frontend Performance Strategy

#### Bundle Optimization
```typescript
// Next.js configuration for optimal bundling
const nextConfig = {
  experimental: {
    optimizeCss: true,
    optimizeServerReact: true,
  },
  
  // Bundle analyzer configuration
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
          chunks: 'all',
        },
        common: {
          name: 'common',
          minChunks: 2,
          priority: 5,
          chunks: 'all',
          enforce: true,
        },
      };
    }
    return config;
  },
};
```

#### Rendering Optimization
```typescript
// Strategic use of rendering patterns
interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

// Server Components for static content
export default async function DashboardPage({ searchParams }: PageProps) {
  // Server-side data fetching for initial load
  const initialData = await getInitialDashboardData();
  
  return (
    <div>
      <DashboardHeader data={initialData.metrics} />
      <Suspense fallback={<TransactionListSkeleton />}>
        <TransactionList filters={searchParams} />
      </Suspense>
    </div>
  );
}

// Client Components for interactive features
'use client';
export function TransactionList({ filters }: { filters: any }) {
  const { data, isLoading } = useTransactions(filters);
  
  if (isLoading) return <TransactionListSkeleton />;
  
  return (
    <div>
      {data.map(transaction => (
        <TransactionCard key={transaction.id} transaction={transaction} />
      ))}
    </div>
  );
}
```

### 8.2 API Performance Strategy

#### Caching Implementation
```typescript
// API response caching
class ApiCache {
  private cache = new Map<string, CacheEntry>();
  
  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry || Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }
  
  async set<T>(key: string, data: T, ttlMs: number): Promise<void> {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }
}

// Usage in API routes
export async function GET(request: Request) {
  const cacheKey = `transactions:${request.url}`;
  
  // Try cache first
  const cached = await apiCache.get(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }
  
  // Fetch fresh data
  const data = await fetchTransactions();
  
  // Cache for 5 minutes
  await apiCache.set(cacheKey, data, 5 * 60 * 1000);
  
  return NextResponse.json(data);
}
```

#### Database Query Optimization
```typescript
// Optimized transaction queries
class TransactionRepository {
  // Paginated queries with efficient filtering
  async getTransactions({
    page = 1,
    limit = 50,
    filters = {},
    sortBy = 'soldDate',
    sortOrder = 'desc'
  }: GetTransactionsParams): Promise<PaginatedTransactions> {
    
    // Build efficient query with indexed fields
    const query = this.buildOptimizedQuery(filters);
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Execute query with proper indexing
    const [transactions, total] = await Promise.all([
      query.offset(offset).limit(limit).orderBy(sortBy, sortOrder),
      query.count()
    ]);
    
    return {
      data: transactions,
      pagination: {
        page,
        limit,
        total: total[0].count,
        pages: Math.ceil(total[0].count / limit)
      }
    };
  }
}
```

### 8.3 Monitoring & Performance Metrics

#### Performance Monitoring Setup
```typescript
// Custom performance monitoring
class PerformanceMonitor {
  // Web Vitals tracking
  static trackWebVitals() {
    if (typeof window !== 'undefined') {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(this.sendMetric);
        getFID(this.sendMetric);
        getFCP(this.sendMetric);
        getLCP(this.sendMetric);
        getTTFB(this.sendMetric);
      });
    }
  }
  
  // API performance tracking
  static trackAPIPerformance(endpoint: string, duration: number, success: boolean) {
    const metric = {
      type: 'api-performance',
      endpoint,
      duration,
      success,
      timestamp: Date.now()
    };
    
    this.sendMetric(metric);
  }
  
  private static sendMetric(metric: any) {
    // Send to analytics service (e.g., Vercel Analytics)
    if (window.va) {
      window.va.track('performance-metric', metric);
    }
  }
}
```

---

## 9. Error Handling & Resilience

### 9.1 Frontend Error Handling

#### Error Boundaries Implementation
```typescript
'use client';
import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class GlobalErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Application error:', error, errorInfo);
    
    // Send error to monitoring service
    this.reportError(error, errorInfo);
    
    this.setState({ error, errorInfo });
  }

  private reportError(error: Error, errorInfo: React.ErrorInfo) {
    // Report to error tracking service
    if (typeof window !== 'undefined') {
      window.va?.track('application-error', {
        error: error.message,
        stack: error.stack,
        component: errorInfo.componentStack
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}
```

#### API Error Handling
```typescript
// Centralized API error handling
class APIErrorHandler {
  static handle(error: any): APIErrorResponse {
    // eBay API specific errors
    if (error.response?.data?.errors) {
      return this.handleEbayAPIError(error);
    }
    
    // Network errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Unable to connect to eBay services. Please try again later.',
          recoverable: true
        }
      };
    }
    
    // Rate limiting errors
    if (error.response?.status === 429) {
      return {
        success: false,
        error: {
          code: 'RATE_LIMITED',
          message: 'Too many requests. Please wait before trying again.',
          retryAfter: error.response.headers['retry-after']
        }
      };
    }
    
    // Authentication errors
    if (error.response?.status === 401) {
      return {
        success: false,
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'eBay authentication expired. Please reconnect your account.',
          requiresReauth: true
        }
      };
    }
    
    // Generic server errors
    return {
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An unexpected error occurred. Please try again.',
        recoverable: true
      }
    };
  }
}
```

### 9.2 Backend Resilience

#### Retry Logic Implementation
```typescript
class RetryHandler {
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    backoffMs: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on certain errors
        if (this.isNonRetryableError(error)) {
          throw error;
        }
        
        // Calculate backoff delay (exponential backoff)
        const delay = backoffMs * Math.pow(2, attempt - 1);
        
        console.warn(`Operation failed (attempt ${attempt}/${maxRetries}):`, error);
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw new Error(`Operation failed after ${maxRetries} attempts. Last error: ${lastError.message}`);
  }
  
  private static isNonRetryableError(error: any): boolean {
    // Authentication errors - don't retry
    if (error.response?.status === 401 || error.response?.status === 403) {
      return true;
    }
    
    // Invalid input errors - don't retry
    if (error.response?.status === 400) {
      return true;
    }
    
    return false;
  }
}
```

#### Circuit Breaker Pattern
```typescript
class CircuitBreaker {
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  constructor(
    private maxFailures: number = 5,
    private timeoutMs: number = 60000 // 1 minute
  ) {}
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime < this.timeoutMs) {
        throw new Error('Circuit breaker is OPEN');
      } else {
        this.state = 'HALF_OPEN';
      }
    }
    
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }
  
  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.maxFailures) {
      this.state = 'OPEN';
    }
  }
}
```

---

## 10. Development & Deployment Architecture

### 10.1 Development Workflow

#### Git Workflow Strategy
```
main (production)
├── develop (integration)
│   ├── feature/ebay-sync-improvements
│   ├── feature/profit-calculator-enhancement
│   └── feature/analytics-dashboard
├── hotfix/critical-bug-fix
└── release/v1.1.0
```

#### CI/CD Pipeline Architecture
```yaml
# .github/workflows/ci.yml
name: Continuous Integration

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      # Install dependencies
      - run: npm ci
      
      # Type checking
      - run: npm run type-check
      
      # Linting
      - run: npm run lint
      
      # Unit tests with coverage
      - run: npm run test:coverage
      
      # Integration tests
      - run: npm run test:integration
      
      # Build verification
      - run: npm run build
      
      # Security audit
      - run: npm audit --audit-level moderate

  lighthouse:
    runs-on: ubuntu-latest
    needs: test
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build
      - run: npm start &
      - uses: treosh/lighthouse-ci-action@v10
        with:
          configPath: './lighthouse.config.js'
          uploadArtifacts: true
```

### 10.2 Deployment Architecture

#### Vercel Deployment Configuration
```typescript
// vercel.json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm ci",
  "framework": "nextjs",
  "regions": ["iad1"], // Primary region: US East
  "functions": {
    "src/app/api/**/route.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "s-maxage=300, stale-while-revalidate=60"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/dashboard",
      "destination": "/",
      "permanent": false
    }
  ]
}
```

#### Environment Configuration
```typescript
// Environment schema validation
const DeploymentEnvironment = z.object({
  // eBay API Configuration
  EBAY_CLIENT_ID: z.string().min(1),
  EBAY_CLIENT_SECRET: z.string().min(1),
  EBAY_REDIRECT_URI: z.string().url(),
  EBAY_ENVIRONMENT: z.enum(['production', 'sandbox']).default('production'),
  
  // Security
  TOKEN_ENCRYPTION_KEY: z.string().min(32),
  API_SECRET_KEY: z.string().min(16),
  
  // Performance & Monitoring
  VERCEL_ANALYTICS_ID: z.string().optional(),
  SENTRY_DSN: z.string().url().optional(),
  
  // Feature Flags
  ENABLE_ANALYTICS: z.string().transform(val => val === 'true').default('true'),
  ENABLE_EXPORT: z.string().transform(val => val === 'true').default('true'),
  
  // Rate Limiting
  API_RATE_LIMIT_MAX: z.string().transform(Number).default('100'),
  API_RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'), // 15 minutes
});

export const deploymentConfig = DeploymentEnvironment.parse(process.env);
```

### 10.3 Quality Assurance Architecture

#### Testing Strategy
```typescript
// Jest configuration for comprehensive testing
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};

// Example test structure
describe('ProfitCalculator', () => {
  describe('calculateNetProfit', () => {
    it('should calculate net profit correctly', () => {
      const transaction = {
        soldPrice: 100,
        itemCost: 20,
        shippingCost: 5,
      };
      
      const result = ProfitCalculator.calculateNetProfit(transaction);
      
      expect(result.netProfit).toBe(61.45); // 100 - 20 - 5 - 13.25 - 0.30
      expect(result.profitMargin).toBe(61.45);
    });
  });
});
```

#### Performance Budgets
```javascript
// lighthouse.config.js
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000/', 'http://localhost:3000/transactions'],
      startServerCommand: 'npm start',
      startServerReadyPattern: 'ready',
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['error', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 4000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

---

## 11. Future Architecture Considerations

### 11.1 Scalability Architecture

#### Database Migration Strategy
```typescript
// Future PostgreSQL migration
interface DatabaseMigrationPlan {
  phase1: {
    description: "Dual-write implementation";
    tasks: [
      "Set up PostgreSQL instance",
      "Implement database schema",
      "Create data migration scripts",
      "Add dual-write capability"
    ];
  };
  
  phase2: {
    description: "Read migration";
    tasks: [
      "Migrate read operations to PostgreSQL",
      "Performance testing and optimization",
      "Fallback mechanism implementation"
    ];
  };
  
  phase3: {
    description: "Complete migration";
    tasks: [
      "Remove local storage dependency",
      "Clean up migration code",
      "Performance monitoring setup"
    ];
  };
}
```

#### Multi-User Architecture
```typescript
// Future multi-user support design
interface MultiUserArchitecture {
  authentication: {
    provider: "NextAuth.js";
    strategies: ["email", "google", "github"];
    roles: ["user", "admin"];
  };
  
  dataIsolation: {
    strategy: "tenant-based";
    implementation: "user_id foreign key";
    security: "row-level security";
  };
  
  billing: {
    provider: "Stripe";
    tiers: ["free", "pro", "enterprise"];
    limits: {
      free: { transactions: 100, ebayAccounts: 1 };
      pro: { transactions: 10000, ebayAccounts: 5 };
    };
  };
}
```

### 11.2 Integration Architecture

#### Multi-Platform Support
```typescript
// Future platform integrations
interface PlatformIntegrationArchitecture {
  amazon: {
    api: "Amazon SP-API";
    authentication: "LWA OAuth 2.0";
    dataSync: "Similar to eBay implementation";
  };
  
  mercari: {
    api: "Web scraping (no official API)";
    authentication: "Session-based";
    risks: ["Rate limiting", "Structure changes"];
  };
  
  poshmark: {
    api: "No official API";
    implementation: "Email parsing integration";
    limitations: "Manual data entry required";
  };
}
```

### 11.3 Advanced Features Architecture

#### AI/ML Integration
```typescript
// Future AI capabilities
interface AIFeatureArchitecture {
  pricePredicition: {
    model: "Linear regression";
    features: ["historical prices", "market trends", "seasonality"];
    implementation: "TensorFlow.js client-side";
  };
  
  categoryOptimization: {
    model: "Classification model";
    purpose: "Suggest optimal listing categories";
    trainingData: "Historical transaction performance";
  };
  
  demandForecasting: {
    model: "Time series analysis";
    purpose: "Predict best listing times";
    features: ["historical sales velocity", "market trends"];
  };
}
```

---

## 12. Success Metrics & Monitoring

### 12.1 Technical Metrics

#### Performance Monitoring
```typescript
interface PerformanceTargets {
  frontend: {
    firstContentfulPaint: "< 1.5s";
    largestContentfulPaint: "< 2.5s";
    cumulativeLayoutShift: "< 0.1";
    firstInputDelay: "< 100ms";
  };
  
  backend: {
    apiResponseTime: "< 200ms (p95)";
    ebayApiSyncTime: "< 30s for 100 transactions";
    errorRate: "< 0.1%";
    uptime: "> 99.9%";
  };
  
  infrastructure: {
    buildTime: "< 60s";
    deploymentTime: "< 120s";
    testSuiteTime: "< 180s";
  };
}
```

#### Quality Metrics
```typescript
interface QualityTargets {
  code: {
    testCoverage: "> 80%";
    typeScriptCoverage: "100%";
    eslintErrors: "0";
    securityVulnerabilities: "0 high/critical";
  };
  
  user: {
    loadTime: "< 2s";
    errorRate: "< 0.5%";
    syncAccuracy: "> 99.5%";
    dataIntegrity: "100%";
  };
}
```

### 12.2 Business Metrics

#### User Success Metrics
```typescript
interface UserSuccessMetrics {
  adoption: {
    timeToFirstSync: "< 5 minutes";
    costDataCompletion: "> 75% within 30 days";
    weeklyActiveUsage: "> 90%";
  };
  
  efficiency: {
    timeReduction: "> 90% vs manual tracking";
    dataAccuracy: "> 99.9%";
    userSatisfaction: "NPS > 8";
  };
  
  businessValue: {
    profitInsightsGenerated: "Monthly reports viewed > 4x";
    decisionSupport: "Category optimization suggestions used > 50%";
    workflowReplacement: "Google Sheets usage eliminated";
  };
}
```

---

## 13. Documentation & Handover

### 13.1 Technical Documentation Structure

#### Architecture Documentation
- **System Overview**: High-level architecture and data flow
- **API Documentation**: Complete endpoint documentation with examples
- **Component Library**: Reusable component documentation
- **Database Schema**: Data models and relationships
- **Security Practices**: Authentication, authorization, and data protection
- **Performance Guidelines**: Optimization practices and monitoring

#### Development Documentation
- **Setup Guide**: Environment setup and development workflow
- **Coding Standards**: Style guide and best practices
- **Testing Strategy**: Unit, integration, and E2E testing approaches
- **Deployment Process**: CI/CD pipeline and release procedures
- **Troubleshooting Guide**: Common issues and solutions

### 13.2 Team Handover Process

#### Frontend Agent Requirements
- React/Next.js expertise with App Router
- TypeScript proficiency
- Tailwind CSS experience
- State management (Zustand, TanStack Query)
- Performance optimization skills
- Testing with Jest/React Testing Library

#### Backend Agent Requirements
- Next.js API routes expertise
- eBay API integration experience
- Security best practices knowledge
- Error handling and resilience patterns
- Performance optimization
- Testing and validation

---

## 14. Conclusion

This technical architecture provides a comprehensive foundation for building the DealFlow eBay Profit Dashboard. The architecture prioritizes:

- **User Experience**: Fast, intuitive interface with real-time updates
- **Reliability**: Robust error handling and data integrity
- **Security**: Enterprise-grade security practices
- **Scalability**: Architecture that can grow with user needs
- **Maintainability**: Clean code structure and comprehensive documentation

The modular design allows for incremental development while maintaining code quality and performance standards. The DevOps infrastructure is already in place, enabling immediate development start with production-ready deployment capabilities.

**Next Steps:**
1. Frontend Agent: Begin with UI components and dashboard implementation
2. Backend Agent: Start with eBay API integration and sync functionality
3. Iterative development following the defined milestones
4. Continuous testing and performance monitoring throughout development

The architecture is designed to deliver the MVP within the 8-week timeline while providing a foundation for future enhancements and scaling.