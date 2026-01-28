import { Transaction, UserSettings, TransactionFilters, PaginationInfo } from '../types';

/**
 * Storage Service - In production, this would interface with a database
 * For now, uses in-memory storage for development
 */
export class StorageService {
  private static transactions: Transaction[] = [];
  private static userSettings: UserSettings | null = null;
  private static lastSyncTime: Date | null = null;

  /**
   * Get all transactions with optional filtering and pagination
   */
  async getTransactions(
    filters?: TransactionFilters,
    page: number = 1,
    limit: number = 25
  ): Promise<{
    transactions: Transaction[];
    pagination: PaginationInfo;
  }> {
    let filteredTransactions = [...StorageService.transactions];

    // Apply filters
    if (filters) {
      if (filters.dateRange) {
        filteredTransactions = filteredTransactions.filter(t => 
          t.soldDate >= filters.dateRange!.start && 
          t.soldDate <= filters.dateRange!.end
        );
      }

      if (filters.minProfit !== undefined) {
        filteredTransactions = filteredTransactions.filter(t => 
          t.netProfit >= filters.minProfit!
        );
      }

      if (filters.maxProfit !== undefined) {
        filteredTransactions = filteredTransactions.filter(t => 
          t.netProfit <= filters.maxProfit!
        );
      }

      if (filters.category) {
        filteredTransactions = filteredTransactions.filter(t => 
          t.category?.toLowerCase().includes(filters.category!.toLowerCase())
        );
      }

      if (filters.condition) {
        filteredTransactions = filteredTransactions.filter(t => 
          t.condition?.toLowerCase().includes(filters.condition!.toLowerCase())
        );
      }

      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredTransactions = filteredTransactions.filter(t => 
          t.title.toLowerCase().includes(searchTerm) ||
          t.category?.toLowerCase().includes(searchTerm) ||
          t.notes?.toLowerCase().includes(searchTerm)
        );
      }

      // Apply sorting
      if (filters.sortBy) {
        filteredTransactions.sort((a, b) => {
          let aVal: string | number | Date, bVal: string | number | Date;
          
          switch (filters.sortBy) {
            case 'soldDate':
              aVal = a.soldDate.getTime();
              bVal = b.soldDate.getTime();
              break;
            case 'soldPrice':
              aVal = a.soldPrice;
              bVal = b.soldPrice;
              break;
            case 'netProfit':
              aVal = a.netProfit;
              bVal = b.netProfit;
              break;
            case 'profitMargin':
              aVal = a.profitMargin;
              bVal = b.profitMargin;
              break;
            default:
              return 0;
          }

          const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
          return filters.sortOrder === 'desc' ? -comparison : comparison;
        });
      }
    }

    // Apply pagination
    const total = filteredTransactions.length;
    const pages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedTransactions = filteredTransactions.slice(offset, offset + limit);

    return {
      transactions: paginatedTransactions,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    };
  }

  /**
   * Get a single transaction by ID
   */
  async getTransaction(id: string): Promise<Transaction | null> {
    const transaction = StorageService.transactions.find(t => t.id === id);
    return transaction || null;
  }

  /**
   * Get transaction by eBay transaction ID
   */
  async getTransactionByEbayId(ebayTransactionId: string): Promise<Transaction | null> {
    const transaction = StorageService.transactions.find(t => 
      t.ebayTransactionId === ebayTransactionId
    );
    return transaction || null;
  }

  /**
   * Save a new transaction
   */
  async saveTransaction(transaction: Transaction): Promise<Transaction> {
    // Ensure unique ID
    if (StorageService.transactions.find(t => t.id === transaction.id)) {
      throw new Error(`Transaction with ID ${transaction.id} already exists`);
    }

    StorageService.transactions.push(transaction);
    return transaction;
  }

  /**
   * Update an existing transaction
   */
  async updateTransaction(transaction: Transaction): Promise<Transaction> {
    const index = StorageService.transactions.findIndex(t => t.id === transaction.id);
    
    if (index === -1) {
      throw new Error(`Transaction with ID ${transaction.id} not found`);
    }

    StorageService.transactions[index] = { ...transaction };
    return StorageService.transactions[index];
  }

  /**
   * Delete a transaction
   */
  async deleteTransaction(id: string): Promise<boolean> {
    const index = StorageService.transactions.findIndex(t => t.id === id);
    
    if (index === -1) {
      return false;
    }

    StorageService.transactions.splice(index, 1);
    return true;
  }

  /**
   * Get user settings
   */
  async getUserSettings(): Promise<UserSettings | null> {
    return StorageService.userSettings;
  }

  /**
   * Save user settings
   */
  async saveUserSettings(settings: UserSettings): Promise<UserSettings> {
    StorageService.userSettings = settings;
    return settings;
  }

  /**
   * Update last sync time
   */
  async updateLastSyncTime(syncTime: Date): Promise<void> {
    StorageService.lastSyncTime = syncTime;
  }

  /**
   * Get last sync time
   */
  async getLastSyncTime(): Promise<Date | null> {
    return StorageService.lastSyncTime;
  }

  /**
   * Get transaction analytics for a date range
   */
  async getAnalytics(startDate: Date, endDate: Date): Promise<{
    totalTransactions: number;
    totalRevenue: number;
    totalProfit: number;
    averageProfit: number;
    averageMargin: number;
    averageListingDays: number;
    topCategories: Array<{ category: string; count: number; profit: number }>;
  }> {
    const transactions = StorageService.transactions.filter(t => 
      t.soldDate >= startDate && t.soldDate <= endDate
    );

    if (transactions.length === 0) {
      return {
        totalTransactions: 0,
        totalRevenue: 0,
        totalProfit: 0,
        averageProfit: 0,
        averageMargin: 0,
        averageListingDays: 0,
        topCategories: [],
      };
    }

    const totalRevenue = transactions.reduce((sum, t) => sum + t.soldPrice, 0);
    const totalProfit = transactions.reduce((sum, t) => sum + t.netProfit, 0);
    const totalListingDays = transactions.reduce((sum, t) => sum + t.daysListed, 0);
    const totalMargin = transactions.reduce((sum, t) => sum + t.profitMargin, 0);

    // Calculate top categories
    const categoryMap = new Map<string, { count: number; profit: number }>();
    transactions.forEach(t => {
      const category = t.category || 'Other';
      const existing = categoryMap.get(category) || { count: 0, profit: 0 };
      categoryMap.set(category, {
        count: existing.count + 1,
        profit: existing.profit + t.netProfit,
      });
    });

    const topCategories = Array.from(categoryMap.entries())
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5);

    return {
      totalTransactions: transactions.length,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalProfit: Number(totalProfit.toFixed(2)),
      averageProfit: Number((totalProfit / transactions.length).toFixed(2)),
      averageMargin: Number((totalMargin / transactions.length).toFixed(2)),
      averageListingDays: Number((totalListingDays / transactions.length).toFixed(1)),
      topCategories,
    };
  }

  /**
   * Initialize with sample data for development
   */
  async initializeSampleData(): Promise<void> {
    if (StorageService.transactions.length > 0) {
      return; // Already initialized
    }

    // Add sample transactions
    const sampleTransactions: Transaction[] = [
      {
        id: '1',
        ebayTransactionId: 'ebay_123456',
        ebayItemId: 'item_789',
        title: 'Pokemon Charizard VMAX - Brilliant Stars',
        soldPrice: 45.99,
        soldDate: new Date('2024-01-20T10:30:00Z'),
        listedDate: new Date('2024-01-15T14:20:00Z'),
        itemCost: 25.00,
        ebayFees: {
          finalValueFee: 6.09,
          paymentProcessingFee: 0.30,
          total: 6.39,
        },
        shippingCost: 4.50,
        shippingService: 'eBay Standard Envelope',
        netProfit: 10.10,
        profitMargin: 21.98,
        daysListed: 5,
        category: 'Trading Cards',
        condition: 'Near Mint',
        syncedAt: new Date('2024-01-20T11:00:00Z'),
        syncStatus: 'synced',
      },
      {
        id: '2',
        ebayTransactionId: 'ebay_234567',
        ebayItemId: 'item_890',
        title: 'Pokemon Pikachu VMAX - Vivid Voltage',
        soldPrice: 32.50,
        soldDate: new Date('2024-01-19T15:45:00Z'),
        listedDate: new Date('2024-01-12T09:15:00Z'),
        itemCost: 18.75,
        ebayFees: {
          finalValueFee: 4.31,
          paymentProcessingFee: 0.30,
          total: 4.61,
        },
        shippingCost: 1.50,
        shippingService: 'PWE',
        netProfit: 7.64,
        profitMargin: 23.51,
        daysListed: 7,
        category: 'Trading Cards',
        condition: 'Near Mint',
        syncedAt: new Date('2024-01-19T16:00:00Z'),
        syncStatus: 'synced',
      },
    ];

    StorageService.transactions = sampleTransactions;
  }
}