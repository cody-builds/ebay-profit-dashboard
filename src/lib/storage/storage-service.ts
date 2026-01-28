import { Transaction, UserSettings, TransactionFilters, PaginationInfo } from '../types';

export interface PaginatedTransactions {
  data: Transaction[];
  pagination: PaginationInfo;
}

/**
 * Local Storage Service for managing transactions and settings
 * Browser-based storage for MVP - will be replaced with database later
 */
export class StorageService {
  private readonly STORAGE_KEY = 'dealflow_data';
  private readonly SETTINGS_KEY = 'dealflow_settings';
  private readonly SYNC_KEY = 'dealflow_sync';

  /**
   * Get all transactions with optional filtering and pagination
   */
  async getTransactions(
    filters?: TransactionFilters,
    page: number = 1,
    limit: number = 50
  ): Promise<PaginatedTransactions> {
    const allTransactions = this.loadTransactions();
    
    // Apply filters
    let filteredTransactions = this.applyFilters(allTransactions, filters);
    
    // Apply sorting
    if (filters?.sortBy) {
      filteredTransactions = this.applySorting(filteredTransactions, filters.sortBy, filters.sortOrder);
    } else {
      // Default sort by sold date, newest first
      filteredTransactions.sort((a, b) => b.soldDate.getTime() - a.soldDate.getTime());
    }

    // Calculate pagination
    const total = filteredTransactions.length;
    const pages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedData = filteredTransactions.slice(offset, offset + limit);

    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    };
  }

  /**
   * Get single transaction by ID
   */
  async getTransaction(id: string): Promise<Transaction | null> {
    const transactions = this.loadTransactions();
    return transactions.find(t => t.id === id) || null;
  }

  /**
   * Get transaction by eBay transaction ID
   */
  async getTransactionByEbayId(ebayTransactionId: string): Promise<Transaction | null> {
    const transactions = this.loadTransactions();
    return transactions.find(t => t.ebayTransactionId === ebayTransactionId) || null;
  }

  /**
   * Save new transaction
   */
  async saveTransaction(transaction: Transaction): Promise<void> {
    const transactions = this.loadTransactions();
    transactions.push(transaction);
    this.saveTransactions(transactions);
  }

  /**
   * Update existing transaction
   */
  async updateTransaction(updatedTransaction: Transaction): Promise<void> {
    const transactions = this.loadTransactions();
    const index = transactions.findIndex(t => t.id === updatedTransaction.id);
    
    if (index === -1) {
      throw new Error(`Transaction not found: ${updatedTransaction.id}`);
    }
    
    transactions[index] = updatedTransaction;
    this.saveTransactions(transactions);
  }

  /**
   * Delete transaction
   */
  async deleteTransaction(id: string): Promise<void> {
    const transactions = this.loadTransactions();
    const filteredTransactions = transactions.filter(t => t.id !== id);
    
    if (filteredTransactions.length === transactions.length) {
      throw new Error(`Transaction not found: ${id}`);
    }
    
    this.saveTransactions(filteredTransactions);
  }

  /**
   * Bulk update transactions
   */
  async bulkUpdateTransactions(updates: Array<{ id: string; data: Partial<Transaction> }>): Promise<void> {
    const transactions = this.loadTransactions();
    
    for (const update of updates) {
      const index = transactions.findIndex(t => t.id === update.id);
      if (index !== -1) {
        transactions[index] = { ...transactions[index], ...update.data };
      }
    }
    
    this.saveTransactions(transactions);
  }

  /**
   * Get user settings
   */
  async getSettings(): Promise<UserSettings | null> {
    if (typeof window === 'undefined') return null;
    
    try {
      const settingsData = localStorage.getItem(this.SETTINGS_KEY);
      if (!settingsData) return null;
      
      const parsed = JSON.parse(settingsData);
      return this.deserializeSettings(parsed);
    } catch (error) {
      console.error('Error loading settings:', error);
      return null;
    }
  }

  /**
   * Save user settings
   */
  async saveSettings(settings: UserSettings): Promise<void> {
    if (typeof window === 'undefined') return;
    
    try {
      const serialized = this.serializeSettings(settings);
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(serialized));
    } catch (error) {
      console.error('Error saving settings:', error);
      throw new Error('Failed to save settings');
    }
  }

  /**
   * Update last sync time
   */
  async updateLastSyncTime(syncTime: Date): Promise<void> {
    if (typeof window === 'undefined') return;
    
    try {
      const syncData = {
        lastSyncTime: syncTime.toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(this.SYNC_KEY, JSON.stringify(syncData));
    } catch (error) {
      console.error('Error saving sync time:', error);
    }
  }

  /**
   * Get last sync time
   */
  async getLastSyncTime(): Promise<Date | null> {
    if (typeof window === 'undefined') return null;
    
    try {
      const syncData = localStorage.getItem(this.SYNC_KEY);
      if (!syncData) return null;
      
      const parsed = JSON.parse(syncData);
      return new Date(parsed.lastSyncTime);
    } catch (error) {
      console.error('Error loading sync time:', error);
      return null;
    }
  }

  /**
   * Export all data
   */
  async exportData(): Promise<{ transactions: Transaction[]; settings: UserSettings | null }> {
    const transactions = this.loadTransactions();
    const settings = await this.getSettings();
    
    return {
      transactions,
      settings,
    };
  }

  /**
   * Clear all data
   */
  async clearAllData(): Promise<void> {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.SETTINGS_KEY);
    localStorage.removeItem(this.SYNC_KEY);
  }

  /**
   * Load transactions from localStorage
   */
  private loadTransactions(): Transaction[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return [];
      
      const parsed = JSON.parse(data);
      return parsed.transactions?.map(this.deserializeTransaction) || [];
    } catch (error) {
      console.error('Error loading transactions:', error);
      return [];
    }
  }

  /**
   * Save transactions to localStorage
   */
  private saveTransactions(transactions: Transaction[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      const data = {
        transactions: transactions.map(this.serializeTransaction),
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving transactions:', error);
      throw new Error('Failed to save transactions');
    }
  }

  /**
   * Serialize transaction for storage (convert Dates to strings)
   */
  private serializeTransaction(transaction: Transaction): any {
    return {
      ...transaction,
      soldDate: transaction.soldDate.toISOString(),
      listedDate: transaction.listedDate.toISOString(),
      syncedAt: transaction.syncedAt.toISOString(),
      costUpdatedAt: transaction.costUpdatedAt?.toISOString(),
    };
  }

  /**
   * Deserialize transaction from storage (convert strings to Dates)
   */
  private deserializeTransaction(data: any): Transaction {
    return {
      ...data,
      soldDate: new Date(data.soldDate),
      listedDate: new Date(data.listedDate),
      syncedAt: new Date(data.syncedAt),
      costUpdatedAt: data.costUpdatedAt ? new Date(data.costUpdatedAt) : undefined,
    };
  }

  /**
   * Serialize settings for storage
   */
  private serializeSettings(settings: UserSettings): any {
    return {
      ...settings,
      createdAt: settings.createdAt.toISOString(),
      updatedAt: settings.updatedAt.toISOString(),
      ebayTokens: settings.ebayTokens ? {
        ...settings.ebayTokens,
        expiresAt: settings.ebayTokens.expiresAt.toISOString(),
      } : undefined,
    };
  }

  /**
   * Deserialize settings from storage
   */
  private deserializeSettings(data: any): UserSettings {
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      ebayTokens: data.ebayTokens ? {
        ...data.ebayTokens,
        expiresAt: new Date(data.ebayTokens.expiresAt),
      } : undefined,
    };
  }

  /**
   * Apply filters to transaction list
   */
  private applyFilters(transactions: Transaction[], filters?: TransactionFilters): Transaction[] {
    if (!filters) return transactions;

    return transactions.filter(transaction => {
      // Date range filter
      if (filters.dateRange) {
        const soldDate = transaction.soldDate;
        if (soldDate < filters.dateRange.start || soldDate > filters.dateRange.end) {
          return false;
        }
      }

      // Profit range filters
      if (filters.minProfit !== undefined && transaction.netProfit < filters.minProfit) {
        return false;
      }
      if (filters.maxProfit !== undefined && transaction.netProfit > filters.maxProfit) {
        return false;
      }

      // Category filter
      if (filters.category && transaction.category !== filters.category) {
        return false;
      }

      // Condition filter
      if (filters.condition && transaction.condition !== filters.condition) {
        return false;
      }

      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const title = transaction.title.toLowerCase();
        if (!title.includes(searchTerm)) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Apply sorting to transaction list
   */
  private applySorting(
    transactions: Transaction[],
    sortBy: string,
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Transaction[] {
    return transactions.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'soldDate':
          aValue = a.soldDate.getTime();
          bValue = b.soldDate.getTime();
          break;
        case 'soldPrice':
          aValue = a.soldPrice;
          bValue = b.soldPrice;
          break;
        case 'netProfit':
          aValue = a.netProfit;
          bValue = b.netProfit;
          break;
        case 'profitMargin':
          aValue = a.profitMargin;
          bValue = b.profitMargin;
          break;
        default:
          aValue = a.soldDate.getTime();
          bValue = b.soldDate.getTime();
      }

      if (sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
  }
}