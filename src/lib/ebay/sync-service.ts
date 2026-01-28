import { EbayAPIClient, createEbayClient } from './client';
import { EbayTransactionData, SyncProgress, SyncOptions } from './types';
import { Transaction } from '../types';
import { StorageService } from '../storage/storage-service';

/**
 * eBay Transaction Sync Service
 * Handles automatic synchronization of eBay transactions
 */
export class EbaySyncService {
  private ebayClient: EbayAPIClient;
  private storageService: StorageService;
  private syncInProgress: boolean = false;
  private currentSyncProgress: SyncProgress | null = null;

  constructor(storageService: StorageService) {
    this.ebayClient = createEbayClient();
    this.storageService = storageService;
  }

  /**
   * Sync eBay transactions for the specified date range
   */
  async syncTransactions(
    accessToken: string,
    options: SyncOptions = {}
  ): Promise<{
    success: boolean;
    newTransactions: number;
    updatedTransactions: number;
    errors: string[];
    syncTime: Date;
  }> {
    if (this.syncInProgress) {
      throw new Error('Sync is already in progress');
    }

    this.syncInProgress = true;
    const errors: string[] = [];
    let newTransactions = 0;
    let updatedTransactions = 0;

    try {
      const {
        daysBack = 30,
        batchSize = 200,
        maxRetries = 3,
      } = options;

      // Calculate date range
      const modTimeTo = new Date();
      const modTimeFrom = new Date(Date.now() - (daysBack * 24 * 60 * 60 * 1000));

      console.log(`Starting eBay sync: ${modTimeFrom.toISOString()} to ${modTimeTo.toISOString()}`);

      // Initialize progress tracking
      this.currentSyncProgress = {
        total: 0,
        processed: 0,
        errors: 0,
        currentPage: 1,
        totalPages: 1,
        status: 'starting',
      };

      // Get first page to determine total pages
      let pageNumber = 1;
      let hasMorePages = true;

      while (hasMorePages) {
        this.currentSyncProgress.status = 'fetching';
        this.currentSyncProgress.currentPage = pageNumber;

        try {
          const response = await this.retryOperation(
            () => this.ebayClient.getSellerTransactions(
              accessToken,
              modTimeFrom,
              modTimeTo,
              pageNumber,
              batchSize
            ),
            maxRetries
          );

          // Update progress with total information
          if (pageNumber === 1) {
            this.currentSyncProgress.total = response.PaginationResult.TotalNumberOfEntries;
            this.currentSyncProgress.totalPages = response.PaginationResult.TotalNumberOfPages;
          }

          // Process transactions from this page
          if (response.TransactionArray?.Transaction) {
            this.currentSyncProgress.status = 'processing';
            
            for (const ebayTransaction of response.TransactionArray.Transaction) {
              try {
                const transactionData = this.ebayClient.transformTransaction(ebayTransaction);
                const existingTransaction = await this.storageService.getTransactionByEbayId(
                  transactionData.transactionId
                );

                if (existingTransaction) {
                  // Update existing transaction
                  const updatedTransaction = await this.updateExistingTransaction(
                    existingTransaction,
                    transactionData
                  );
                  await this.storageService.updateTransaction(updatedTransaction);
                  updatedTransactions++;
                } else {
                  // Create new transaction
                  const newTransaction = await this.createNewTransaction(transactionData);
                  await this.storageService.saveTransaction(newTransaction);
                  newTransactions++;
                }

                this.currentSyncProgress.processed++;
              } catch (error) {
                const errorMessage = `Failed to process transaction ${ebayTransaction.TransactionID}: ${error}`;
                errors.push(errorMessage);
                console.error(errorMessage);
                this.currentSyncProgress.errors++;
              }
            }
          }

          // Check if we have more pages
          hasMorePages = pageNumber < response.PaginationResult.TotalNumberOfPages;
          pageNumber++;

          // Add small delay between requests to respect rate limits
          if (hasMorePages) {
            await new Promise(resolve => setTimeout(resolve, 250));
          }
        } catch (error) {
          const errorMessage = `Failed to fetch page ${pageNumber}: ${error}`;
          errors.push(errorMessage);
          console.error(errorMessage);
          this.currentSyncProgress.errors++;
          break;
        }
      }

      this.currentSyncProgress.status = 'completed';
      
      // Update last sync time
      await this.storageService.updateLastSyncTime(new Date());

      return {
        success: errors.length === 0,
        newTransactions,
        updatedTransactions,
        errors,
        syncTime: new Date(),
      };
    } catch (error) {
      this.currentSyncProgress = {
        ...this.currentSyncProgress!,
        status: 'error',
      };
      
      const errorMessage = `Sync failed: ${error}`;
      errors.push(errorMessage);
      console.error(errorMessage);

      return {
        success: false,
        newTransactions,
        updatedTransactions,
        errors,
        syncTime: new Date(),
      };
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Get current sync progress
   */
  getSyncProgress(): SyncProgress | null {
    return this.currentSyncProgress;
  }

  /**
   * Check if sync is currently in progress
   */
  isSyncing(): boolean {
    return this.syncInProgress;
  }

  /**
   * Create new transaction from eBay data
   */
  private async createNewTransaction(ebayData: EbayTransactionData): Promise<Transaction> {
    const daysListed = Math.ceil(
      (ebayData.soldDate.getTime() - ebayData.listedDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      id: crypto.randomUUID(),
      ebayTransactionId: ebayData.transactionId,
      ebayItemId: ebayData.itemId,
      title: ebayData.title,
      soldPrice: ebayData.soldPrice,
      soldDate: ebayData.soldDate,
      listedDate: ebayData.listedDate,
      shippingCost: ebayData.shippingCost,
      shippingService: ebayData.shippingService,
      category: ebayData.category,
      condition: ebayData.condition,
      ebayFees: {
        finalValueFee: ebayData.fees.finalValueFee,
        paymentProcessingFee: ebayData.fees.paymentProcessingFee,
        total: ebayData.fees.total,
      },
      netProfit: this.calculateNetProfit(ebayData),
      profitMargin: this.calculateProfitMargin(ebayData),
      daysListed,
      syncedAt: new Date(),
      syncStatus: 'synced',
    };
  }

  /**
   * Update existing transaction with new eBay data
   */
  private async updateExistingTransaction(
    existing: Transaction,
    ebayData: EbayTransactionData
  ): Promise<Transaction> {
    const daysListed = Math.ceil(
      (ebayData.soldDate.getTime() - ebayData.listedDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      ...existing,
      title: ebayData.title,
      soldPrice: ebayData.soldPrice,
      soldDate: ebayData.soldDate,
      listedDate: ebayData.listedDate,
      shippingCost: ebayData.shippingCost,
      shippingService: ebayData.shippingService,
      category: ebayData.category,
      condition: ebayData.condition,
      ebayFees: {
        finalValueFee: ebayData.fees.finalValueFee,
        paymentProcessingFee: ebayData.fees.paymentProcessingFee,
        total: ebayData.fees.total,
      },
      netProfit: this.calculateNetProfit(ebayData, existing.itemCost),
      profitMargin: this.calculateProfitMargin(ebayData, existing.itemCost),
      daysListed,
      syncedAt: new Date(),
      syncStatus: 'synced',
    };
  }

  /**
   * Calculate net profit (Sold Price - eBay Fees - Shipping - Item Cost)
   */
  private calculateNetProfit(ebayData: EbayTransactionData, itemCost: number = 0): number {
    return ebayData.soldPrice - ebayData.fees.total - ebayData.shippingCost - itemCost;
  }

  /**
   * Calculate profit margin percentage
   */
  private calculateProfitMargin(ebayData: EbayTransactionData, itemCost: number = 0): number {
    if (ebayData.soldPrice === 0) return 0;
    const netProfit = this.calculateNetProfit(ebayData, itemCost);
    return (netProfit / ebayData.soldPrice) * 100;
  }

  /**
   * Retry operation with exponential backoff
   */
  private async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (this.isNonRetryableError(error)) {
          throw error;
        }

        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt - 1) * 1000; // Exponential backoff
          console.warn(`Retry attempt ${attempt}/${maxRetries} after ${delay}ms:`, error);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(`Operation failed after ${maxRetries} attempts. Last error: ${lastError!.message}`);
  }

  /**
   * Check if error should not be retried
   */
  private isNonRetryableError(error: Error | unknown): boolean {
    // Don't retry authentication errors
    if (error.message?.includes('401') || error.message?.includes('403')) {
      return true;
    }
    
    // Don't retry bad request errors
    if (error.message?.includes('400')) {
      return true;
    }

    return false;
  }
}