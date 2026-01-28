import { SupabaseStorageService } from '@/lib/storage/supabase-storage-service';
import { Transaction } from '@/lib/types';

export async function seedSampleDataForUser(): Promise<void> {
  try {
    const storageService = new SupabaseStorageService();
    
    // Check if user already has transactions
    const existingTransactions = await storageService.getTransactions({}, 1, 1);
    if (existingTransactions.transactions.length > 0) {
      console.log('User already has transactions, skipping sample data seeding');
      return;
    }

    // Generate sample transactions
    const sampleTransactions: Transaction[] = [
      {
        id: crypto.randomUUID(),
        ebayTransactionId: `demo_${crypto.randomUUID().slice(0, 8)}`,
        ebayItemId: `item_${crypto.randomUUID().slice(0, 8)}`,
        title: 'Pokemon Charizard VMAX - Brilliant Stars CGC 9.5',
        soldPrice: 85.99,
        soldDate: new Date('2024-01-25T14:30:00Z'),
        listedDate: new Date('2024-01-18T10:15:00Z'),
        itemCost: 45.00,
        costUpdatedAt: new Date('2024-01-18T10:15:00Z'),
        costUpdatedBy: 'user',
        ebayFees: {
          finalValueFee: 11.38,
          paymentProcessingFee: 0.30,
          total: 11.68,
        },
        shippingCost: 5.50,
        shippingService: 'eBay Standard Envelope',
        netProfit: 23.81,
        profitMargin: 27.69,
        daysListed: 7,
        category: 'Trading Cards',
        condition: 'Mint',
        notes: 'High-grade Charizard, strong seller',
        tags: ['Pokemon', 'Charizard', 'CGC', 'High Grade'],
        syncedAt: new Date('2024-01-25T14:35:00Z'),
        syncStatus: 'synced',
      },
      {
        id: crypto.randomUUID(),
        ebayTransactionId: `demo_${crypto.randomUUID().slice(0, 8)}`,
        ebayItemId: `item_${crypto.randomUUID().slice(0, 8)}`,
        title: 'Pokemon Pikachu VMAX - Vivid Voltage PSA 10',
        soldPrice: 62.50,
        soldDate: new Date('2024-01-24T09:45:00Z'),
        listedDate: new Date('2024-01-19T16:20:00Z'),
        itemCost: 32.00,
        costUpdatedAt: new Date('2024-01-19T16:20:00Z'),
        costUpdatedBy: 'user',
        ebayFees: {
          finalValueFee: 8.28,
          paymentProcessingFee: 0.30,
          total: 8.58,
        },
        shippingCost: 4.50,
        shippingService: 'First Class Mail',
        netProfit: 17.42,
        profitMargin: 27.87,
        daysListed: 5,
        category: 'Trading Cards',
        condition: 'Mint',
        notes: 'Perfect 10 grade, quick sale',
        tags: ['Pokemon', 'Pikachu', 'PSA', 'Perfect Grade'],
        syncedAt: new Date('2024-01-24T09:50:00Z'),
        syncStatus: 'synced',
      },
      {
        id: crypto.randomUUID(),
        ebayTransactionId: `demo_${crypto.randomUUID().slice(0, 8)}`,
        ebayItemId: `item_${crypto.randomUUID().slice(0, 8)}`,
        title: 'Pokemon Base Set Booster Box - Unlimited Edition',
        soldPrice: 289.99,
        soldDate: new Date('2024-01-22T18:15:00Z'),
        listedDate: new Date('2024-01-15T12:30:00Z'),
        itemCost: 185.00,
        costUpdatedAt: new Date('2024-01-15T12:30:00Z'),
        costUpdatedBy: 'user',
        ebayFees: {
          finalValueFee: 38.40,
          paymentProcessingFee: 0.30,
          total: 38.70,
        },
        shippingCost: 12.50,
        shippingService: 'Priority Mail',
        netProfit: 53.79,
        profitMargin: 18.54,
        daysListed: 7,
        category: 'Trading Cards',
        condition: 'New',
        notes: 'Sealed booster box, good condition',
        tags: ['Pokemon', 'Base Set', 'Booster Box', 'Sealed'],
        syncedAt: new Date('2024-01-22T18:20:00Z'),
        syncStatus: 'synced',
      },
      {
        id: crypto.randomUUID(),
        ebayTransactionId: `demo_${crypto.randomUUID().slice(0, 8)}`,
        ebayItemId: `item_${crypto.randomUUID().slice(0, 8)}`,
        title: 'Pokemon Lugia VSTAR - Silver Tempest Secret Rare',
        soldPrice: 34.95,
        soldDate: new Date('2024-01-21T13:20:00Z'),
        listedDate: new Date('2024-01-17T08:45:00Z'),
        itemCost: 18.50,
        costUpdatedAt: new Date('2024-01-17T08:45:00Z'),
        costUpdatedBy: 'user',
        ebayFees: {
          finalValueFee: 4.63,
          paymentProcessingFee: 0.30,
          total: 4.93,
        },
        shippingCost: 1.50,
        shippingService: 'PWE',
        netProfit: 10.02,
        profitMargin: 28.66,
        daysListed: 4,
        category: 'Trading Cards',
        condition: 'Near Mint',
        notes: 'Beautiful secret rare card',
        tags: ['Pokemon', 'Lugia', 'Secret Rare', 'VSTAR'],
        syncedAt: new Date('2024-01-21T13:25:00Z'),
        syncStatus: 'synced',
      },
      {
        id: crypto.randomUUID(),
        ebayTransactionId: `demo_${crypto.randomUUID().slice(0, 8)}`,
        ebayItemId: `item_${crypto.randomUUID().slice(0, 8)}`,
        title: 'Pokemon Celebrations ETB - Elite Trainer Box Sealed',
        soldPrice: 47.99,
        soldDate: new Date('2024-01-20T11:30:00Z'),
        listedDate: new Date('2024-01-16T14:15:00Z'),
        itemCost: 28.00,
        costUpdatedAt: new Date('2024-01-16T14:15:00Z'),
        costUpdatedBy: 'user',
        ebayFees: {
          finalValueFee: 6.36,
          paymentProcessingFee: 0.30,
          total: 6.66,
        },
        shippingCost: 8.50,
        shippingService: 'Priority Mail',
        netProfit: 4.83,
        profitMargin: 10.07,
        daysListed: 4,
        category: 'Trading Cards',
        condition: 'New',
        notes: 'Anniversary set, moderate profit',
        tags: ['Pokemon', 'Celebrations', 'ETB', 'Anniversary'],
        syncedAt: new Date('2024-01-20T11:35:00Z'),
        syncStatus: 'synced',
      },
    ];

    // Save sample transactions
    for (const transaction of sampleTransactions) {
      await storageService.saveTransaction(transaction);
    }

    console.log(`Seeded ${sampleTransactions.length} sample transactions for new user`);
  } catch (error) {
    console.error('Error seeding sample data:', error);
    throw error;
  }
}

export async function createDefaultUserSettings(): Promise<void> {
  try {
    const storageService = new SupabaseStorageService();
    
    // Check if user already has settings
    const existingSettings = await storageService.getUserSettings();
    if (existingSettings) {
      console.log('User already has settings, skipping default settings creation');
      return;
    }

    // This should be handled by the database trigger, but in case it doesn't work
    console.log('User settings should be created automatically by database trigger');
  } catch (error) {
    console.error('Error checking/creating default user settings:', error);
    // Don't throw here as settings should be created by DB trigger
  }
}