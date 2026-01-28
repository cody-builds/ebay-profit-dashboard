import { createClient } from '@/lib/supabase/client';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { 
  Transaction as DBTransaction, 
  UserSettings as DBUserSettings, 
  Profile,
  TransactionInsert,
  TransactionUpdate,
  UserSettingsUpdate,
  EbayFeeBreakdown
} from '@/lib/supabase/types';
import { Transaction, UserSettings, TransactionFilters, PaginationInfo } from '@/lib/types';

/**
 * Supabase Storage Service - Provides database operations with user isolation
 */
export class SupabaseStorageService {
  private supabase;
  private isServer: boolean;

  constructor(isServer: boolean = false) {
    this.isServer = isServer;
    this.supabase = isServer ? createServerClient() : createClient();
  }

  /**
   * Convert database transaction to application transaction model
   */
  private mapDBToTransaction(dbTransaction: DBTransaction): Transaction {
    const fees = dbTransaction.ebay_fees as EbayFeeBreakdown;
    
    return {
      id: dbTransaction.id,
      ebayTransactionId: dbTransaction.ebay_transaction_id,
      ebayItemId: dbTransaction.ebay_item_id,
      title: dbTransaction.title,
      soldPrice: dbTransaction.sold_price,
      soldDate: new Date(dbTransaction.sold_date),
      listedDate: new Date(dbTransaction.listed_date),
      itemCost: dbTransaction.item_cost || 0,
      costUpdatedAt: dbTransaction.cost_updated_at ? new Date(dbTransaction.cost_updated_at) : undefined,
      costUpdatedBy: dbTransaction.cost_updated_by || undefined,
      ebayFees: {
        finalValueFee: fees.final_value_fee,
        paymentProcessingFee: fees.payment_processing_fee,
        insertionFee: fees.insertion_fee,
        total: fees.total,
      },
      shippingCost: dbTransaction.shipping_cost,
      shippingService: dbTransaction.shipping_service || '',
      netProfit: dbTransaction.net_profit,
      profitMargin: dbTransaction.profit_margin,
      daysListed: dbTransaction.days_listed,
      category: dbTransaction.category || undefined,
      condition: dbTransaction.condition || undefined,
      notes: dbTransaction.notes || undefined,
      tags: dbTransaction.tags || undefined,
      syncedAt: new Date(dbTransaction.synced_at),
      syncStatus: dbTransaction.sync_status as 'synced' | 'pending' | 'error',
      syncError: dbTransaction.sync_error || undefined,
    };
  }

  /**
   * Convert application transaction to database insert model
   */
  private mapTransactionToDB(transaction: Transaction, userId: string): TransactionInsert {
    return {
      id: transaction.id,
      user_id: userId,
      ebay_transaction_id: transaction.ebayTransactionId,
      ebay_item_id: transaction.ebayItemId,
      title: transaction.title,
      sold_price: transaction.soldPrice,
      sold_date: transaction.soldDate.toISOString(),
      listed_date: transaction.listedDate.toISOString(),
      item_cost: transaction.itemCost,
      cost_updated_at: transaction.costUpdatedAt?.toISOString(),
      cost_updated_by: transaction.costUpdatedBy,
      ebay_fees: {
        final_value_fee: transaction.ebayFees.finalValueFee,
        payment_processing_fee: transaction.ebayFees.paymentProcessingFee,
        insertion_fee: transaction.ebayFees.insertionFee,
        total: transaction.ebayFees.total,
      },
      shipping_cost: transaction.shippingCost,
      shipping_service: transaction.shippingService,
      net_profit: transaction.netProfit,
      profit_margin: transaction.profitMargin,
      days_listed: transaction.daysListed,
      category: transaction.category,
      condition: transaction.condition,
      notes: transaction.notes,
      tags: transaction.tags,
      synced_at: transaction.syncedAt.toISOString(),
      sync_status: transaction.syncStatus,
      sync_error: transaction.syncError,
    };
  }

  /**
   * Get current authenticated user
   */
  private async getCurrentUser() {
    const { data: { user }, error } = await this.supabase.auth.getUser();
    if (error || !user) {
      throw new Error('User not authenticated');
    }
    return user;
  }

  /**
   * Get all transactions for the authenticated user with optional filtering and pagination
   */
  async getTransactions(
    filters?: TransactionFilters,
    page: number = 1,
    limit: number = 25
  ): Promise<{
    transactions: Transaction[];
    pagination: PaginationInfo;
  }> {
    const user = await this.getCurrentUser();
    
    let query = this.supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id);

    // Apply filters
    if (filters) {
      if (filters.dateRange) {
        query = query
          .gte('sold_date', filters.dateRange.start.toISOString())
          .lte('sold_date', filters.dateRange.end.toISOString());
      }

      if (filters.minProfit !== undefined) {
        query = query.gte('net_profit', filters.minProfit);
      }

      if (filters.maxProfit !== undefined) {
        query = query.lte('net_profit', filters.maxProfit);
      }

      if (filters.category) {
        query = query.ilike('category', `%${filters.category}%`);
      }

      if (filters.condition) {
        query = query.ilike('condition', `%${filters.condition}%`);
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,category.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`);
      }

      // Apply sorting
      if (filters.sortBy) {
        const column = {
          'soldDate': 'sold_date',
          'soldPrice': 'sold_price',
          'netProfit': 'net_profit',
          'profitMargin': 'profit_margin',
        }[filters.sortBy] || 'sold_date';

        query = query.order(column, { ascending: filters.sortOrder === 'asc' });
      } else {
        query = query.order('sold_date', { ascending: false });
      }
    } else {
      query = query.order('sold_date', { ascending: false });
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch transactions: ${error.message}`);
    }

    const transactions = data?.map(this.mapDBToTransaction) || [];
    const total = count || 0;
    const pages = Math.ceil(total / limit);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    };
  }

  /**
   * Get a single transaction by ID for the authenticated user
   */
  async getTransaction(id: string): Promise<Transaction | null> {
    const user = await this.getCurrentUser();
    
    const { data, error } = await this.supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to fetch transaction: ${error.message}`);
    }

    return this.mapDBToTransaction(data);
  }

  /**
   * Get transaction by eBay transaction ID for the authenticated user
   */
  async getTransactionByEbayId(ebayTransactionId: string): Promise<Transaction | null> {
    const user = await this.getCurrentUser();
    
    const { data, error } = await this.supabase
      .from('transactions')
      .select('*')
      .eq('ebay_transaction_id', ebayTransactionId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to fetch transaction: ${error.message}`);
    }

    return this.mapDBToTransaction(data);
  }

  /**
   * Save a new transaction for the authenticated user
   */
  async saveTransaction(transaction: Transaction): Promise<Transaction> {
    const user = await this.getCurrentUser();
    
    const dbTransaction = this.mapTransactionToDB(transaction, user.id);
    
    const { data, error } = await this.supabase
      .from('transactions')
      .insert(dbTransaction)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save transaction: ${error.message}`);
    }

    return this.mapDBToTransaction(data);
  }

  /**
   * Update an existing transaction for the authenticated user
   */
  async updateTransaction(transaction: Transaction): Promise<Transaction> {
    const user = await this.getCurrentUser();
    
    const updateData: TransactionUpdate = {
      title: transaction.title,
      sold_price: transaction.soldPrice,
      sold_date: transaction.soldDate.toISOString(),
      listed_date: transaction.listedDate.toISOString(),
      item_cost: transaction.itemCost,
      cost_updated_at: transaction.costUpdatedAt?.toISOString(),
      cost_updated_by: transaction.costUpdatedBy,
      ebay_fees: {
        final_value_fee: transaction.ebayFees.finalValueFee,
        payment_processing_fee: transaction.ebayFees.paymentProcessingFee,
        insertion_fee: transaction.ebayFees.insertionFee,
        total: transaction.ebayFees.total,
      },
      shipping_cost: transaction.shippingCost,
      shipping_service: transaction.shippingService,
      net_profit: transaction.netProfit,
      profit_margin: transaction.profitMargin,
      days_listed: transaction.daysListed,
      category: transaction.category,
      condition: transaction.condition,
      notes: transaction.notes,
      tags: transaction.tags,
      sync_status: transaction.syncStatus,
      sync_error: transaction.syncError,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from('transactions')
      .update(updateData)
      .eq('id', transaction.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update transaction: ${error.message}`);
    }

    return this.mapDBToTransaction(data);
  }

  /**
   * Delete a transaction for the authenticated user
   */
  async deleteTransaction(id: string): Promise<boolean> {
    const user = await this.getCurrentUser();
    
    const { error } = await this.supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      throw new Error(`Failed to delete transaction: ${error.message}`);
    }

    return true;
  }

  /**
   * Get user settings for the authenticated user
   */
  async getUserSettings(): Promise<UserSettings | null> {
    const user = await this.getCurrentUser();
    
    const { data, error } = await this.supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to fetch user settings: ${error.message}`);
    }

    // Map database settings to application settings
    const ebayTokens = data.ebay_tokens as any;
    
    return {
      id: data.id,
      userId: data.user_id,
      ebayTokens: ebayTokens ? {
        accessToken: ebayTokens.access_token,
        refreshToken: ebayTokens.refresh_token,
        expiresAt: new Date(ebayTokens.expires_at),
      } : undefined,
      syncFrequency: data.sync_frequency,
      autoSync: data.auto_sync,
      syncHistoryDays: data.sync_history_days,
      defaultView: data.default_view as 'dashboard' | 'transactions' | 'analytics',
      currency: data.currency as 'USD',
      dateFormat: data.date_format,
      defaultShippingCost: data.default_shipping_cost,
      roundingPrecision: data.rounding_precision,
      emailNotifications: data.email_notifications,
      syncFailureAlerts: data.sync_failure_alerts,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  /**
   * Save user settings for the authenticated user
   */
  async saveUserSettings(settings: UserSettings): Promise<UserSettings> {
    const user = await this.getCurrentUser();
    
    const updateData: UserSettingsUpdate = {
      ebay_tokens: settings.ebayTokens ? {
        access_token: settings.ebayTokens.accessToken,
        refresh_token: settings.ebayTokens.refreshToken,
        expires_at: settings.ebayTokens.expiresAt.toISOString(),
      } : null,
      sync_frequency: settings.syncFrequency,
      auto_sync: settings.autoSync,
      sync_history_days: settings.syncHistoryDays,
      default_view: settings.defaultView,
      currency: settings.currency,
      date_format: settings.dateFormat,
      default_shipping_cost: settings.defaultShippingCost,
      rounding_precision: settings.roundingPrecision,
      email_notifications: settings.emailNotifications,
      sync_failure_alerts: settings.syncFailureAlerts,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from('user_settings')
      .update(updateData)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save user settings: ${error.message}`);
    }

    // Return the updated settings
    return await this.getUserSettings() as UserSettings;
  }

  /**
   * Get transaction analytics for the authenticated user
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
    const user = await this.getCurrentUser();
    
    const { data, error } = await this.supabase
      .from('transactions')
      .select('sold_price, net_profit, profit_margin, days_listed, category')
      .eq('user_id', user.id)
      .gte('sold_date', startDate.toISOString())
      .lte('sold_date', endDate.toISOString());

    if (error) {
      throw new Error(`Failed to fetch analytics: ${error.message}`);
    }

    if (!data || data.length === 0) {
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

    const totalRevenue = data.reduce((sum, t) => sum + t.sold_price, 0);
    const totalProfit = data.reduce((sum, t) => sum + t.net_profit, 0);
    const totalListingDays = data.reduce((sum, t) => sum + t.days_listed, 0);
    const totalMargin = data.reduce((sum, t) => sum + t.profit_margin, 0);

    // Calculate top categories
    const categoryMap = new Map<string, { count: number; profit: number }>();
    data.forEach(t => {
      const category = t.category || 'Other';
      const existing = categoryMap.get(category) || { count: 0, profit: 0 };
      categoryMap.set(category, {
        count: existing.count + 1,
        profit: existing.profit + t.net_profit,
      });
    });

    const topCategories = Array.from(categoryMap.entries())
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5);

    return {
      totalTransactions: data.length,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalProfit: Number(totalProfit.toFixed(2)),
      averageProfit: Number((totalProfit / data.length).toFixed(2)),
      averageMargin: Number((totalMargin / data.length).toFixed(2)),
      averageListingDays: Number((totalListingDays / data.length).toFixed(1)),
      topCategories,
    };
  }

  /**
   * Get user profile for the authenticated user
   */
  async getUserProfile(): Promise<Profile | null> {
    const user = await this.getCurrentUser();
    
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to fetch user profile: ${error.message}`);
    }

    return data;
  }

  /**
   * Update user profile for the authenticated user
   */
  async updateUserProfile(updates: Partial<Profile>): Promise<Profile> {
    const user = await this.getCurrentUser();
    
    const { data, error } = await this.supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update user profile: ${error.message}`);
    }

    return data;
  }
}