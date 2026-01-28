// Core types for DealFlow

export interface CardListing {
  id: string;
  name: string;
  set: string;
  condition: CardCondition;
  price: number;
  shipping: number;
  seller: string;
  platform: 'tcgplayer' | 'ebay';
  url: string;
  imageUrl?: string;
  quantity?: number;
  listedAt?: Date;
}

export type CardCondition = 
  | 'Near Mint'
  | 'Lightly Played'
  | 'Moderately Played'
  | 'Heavily Played'
  | 'Damaged';

export interface EbaySoldData {
  avgPrice: number;
  lowPrice: number;
  highPrice: number;
  recentSales: number;
  lastSoldAt?: Date;
  priceHistory: PricePoint[];
}

export interface PricePoint {
  date: Date;
  price: number;
}

export interface ArbitrageOpportunity {
  id: string;
  card: CardListing;
  tcgPrice: number;
  tcgShipping: number;
  ebayAvgSold: number;
  ebayLowSold: number;
  ebayHighSold: number;
  recentSalesCount: number;
  
  // Calculated values
  totalBuyCost: number;
  estimatedSalePrice: number;
  ebayFees: number;
  paypalFees: number;
  estimatedShipping: number;
  netProfit: number;
  roi: number;
  profitMargin: number;
  
  // Risk assessment
  riskLevel: 'low' | 'medium' | 'high';
  confidence: number; // 0-100
  
  createdAt: Date;
}

export interface SearchFilters {
  query: string;
  minProfit?: number;
  minROI?: number;
  maxBuyPrice?: number;
  condition?: CardCondition[];
  riskLevel?: ('low' | 'medium' | 'high')[];
  sortBy: 'profit' | 'roi' | 'confidence' | 'recent';
  sortOrder: 'asc' | 'desc';
}

export interface FeeStructure {
  ebayFinalValuePercent: number;
  ebayTransactionFee: number;
  paypalPercent: number;
  paypalFixed: number;
  estimatedShipping: number;
}

// Default fee structure (eBay standard seller)
export const DEFAULT_FEES: FeeStructure = {
  ebayFinalValuePercent: 0.1325, // 13.25% for trading cards
  ebayTransactionFee: 0.30,
  paypalPercent: 0.0349, // 3.49%
  paypalFixed: 0.49,
  estimatedShipping: 1.50, // PWE with toploader
};

export interface PopularCard {
  name: string;
  set: string;
  searchQuery: string;
  category: 'vintage' | 'modern' | 'grail' | 'meta';
  avgPrice: number;
}

// Popular cards to track
export const POPULAR_CARDS: PopularCard[] = [
  { name: 'Charizard ex', set: 'Obsidian Flames', searchQuery: 'charizard ex obsidian flames', category: 'modern', avgPrice: 35 },
  { name: 'Pikachu VMAX', set: 'Vivid Voltage', searchQuery: 'pikachu vmax vivid voltage', category: 'modern', avgPrice: 45 },
  { name: 'Umbreon VMAX Alt Art', set: 'Evolving Skies', searchQuery: 'umbreon vmax alt art evolving skies', category: 'grail', avgPrice: 350 },
  { name: 'Mew ex', set: '151', searchQuery: 'mew ex 151 special art', category: 'modern', avgPrice: 55 },
  { name: 'Miraidon ex', set: 'Scarlet & Violet', searchQuery: 'miraidon ex special art rare', category: 'modern', avgPrice: 40 },
  { name: 'Charizard', set: 'Base Set', searchQuery: 'charizard base set unlimited', category: 'vintage', avgPrice: 150 },
  { name: 'Mewtwo ex', set: '151', searchQuery: 'mewtwo ex 151 special art', category: 'modern', avgPrice: 30 },
  { name: 'Lugia V Alt Art', set: 'Silver Tempest', searchQuery: 'lugia v alt art silver tempest', category: 'grail', avgPrice: 180 },
];
