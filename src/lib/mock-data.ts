import { ArbitrageOpportunity, CardListing, CardCondition } from './types';
import { createArbitrageOpportunity } from './calculator';

// Generate realistic mock data for demonstration
// In production, this would be replaced with actual API calls

const CONDITIONS: CardCondition[] = ['Near Mint', 'Lightly Played', 'Moderately Played'];
const SETS = [
  'Obsidian Flames',
  'Paldea Evolved', 
  '151',
  'Scarlet & Violet',
  'Crown Zenith',
  'Silver Tempest',
  'Evolving Skies',
  'Brilliant Stars',
];

const CARD_NAMES = [
  'Charizard ex',
  'Pikachu VMAX',
  'Umbreon VMAX',
  'Mew ex',
  'Miraidon ex',
  'Mewtwo ex',
  'Lugia V',
  'Rayquaza VMAX',
  'Giratina V',
  'Arceus VSTAR',
  'Palkia VSTAR',
  'Dialga VSTAR',
  'Gardevoir ex',
  'Chien-Pao ex',
  'Roaring Moon ex',
  'Iron Valiant ex',
];

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function generateMockOpportunity(index: number): ArbitrageOpportunity {
  const cardName = CARD_NAMES[index % CARD_NAMES.length];
  const set = SETS[Math.floor(Math.random() * SETS.length)];
  const condition = CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)];
  
  // Base price varies by card
  const basePrice = cardName.includes('Umbreon') || cardName.includes('Lugia') 
    ? randomBetween(80, 200)
    : cardName.includes('Charizard')
    ? randomBetween(30, 80)
    : randomBetween(10, 50);
  
  // TCGPlayer listing (buy price)
  const tcgPrice = Number((basePrice * randomBetween(0.85, 0.95)).toFixed(2));
  const tcgShipping = Math.random() > 0.3 ? 0 : Number(randomBetween(0.99, 4.99).toFixed(2));
  
  // eBay sold data (sell price)
  const ebayAvgSold = Number((basePrice * randomBetween(1.05, 1.25)).toFixed(2));
  const ebayLowSold = Number((ebayAvgSold * 0.85).toFixed(2));
  const ebayHighSold = Number((ebayAvgSold * 1.15).toFixed(2));
  const recentSalesCount = Math.floor(randomBetween(3, 25));
  
  const card: CardListing = {
    id: `tcg-${Date.now()}-${index}`,
    name: cardName,
    set,
    condition,
    price: tcgPrice,
    shipping: tcgShipping,
    seller: `TCGSeller${Math.floor(Math.random() * 1000)}`,
    platform: 'tcgplayer',
    url: `https://www.tcgplayer.com/product/${Math.floor(Math.random() * 1000000)}`,
    imageUrl: `https://images.pokemontcg.io/sv3/${151 + index}/high.png`,
    quantity: Math.floor(randomBetween(1, 5)),
  };
  
  return createArbitrageOpportunity(
    card,
    tcgPrice,
    tcgShipping,
    ebayAvgSold,
    ebayLowSold,
    ebayHighSold,
    recentSalesCount
  );
}

export function generateMockOpportunities(count: number = 20): ArbitrageOpportunity[] {
  const opportunities: ArbitrageOpportunity[] = [];
  
  for (let i = 0; i < count; i++) {
    const opp = generateMockOpportunity(i);
    // Only include profitable opportunities (or some with losses for realism)
    if (opp.netProfit > -5) {
      opportunities.push(opp);
    }
  }
  
  // Sort by profit descending
  return opportunities.sort((a, b) => b.netProfit - a.netProfit);
}

// Generate specific opportunities for demo purposes
export function getDemoOpportunities(): ArbitrageOpportunity[] {
  const demos: ArbitrageOpportunity[] = [
    createArbitrageOpportunity(
      {
        id: 'demo-1',
        name: 'Charizard ex SAR',
        set: 'Obsidian Flames',
        condition: 'Near Mint',
        price: 89.99,
        shipping: 0,
        seller: 'TCGTopDeals',
        platform: 'tcgplayer',
        url: 'https://tcgplayer.com',
      },
      89.99, 0,  // TCG price + shipping
      125.50, 110.00, 145.00, // eBay avg, low, high
      18 // recent sales
    ),
    createArbitrageOpportunity(
      {
        id: 'demo-2',
        name: 'Umbreon VMAX Alt Art',
        set: 'Evolving Skies',
        condition: 'Near Mint',
        price: 285.00,
        shipping: 4.99,
        seller: 'CardMasters',
        platform: 'tcgplayer',
        url: 'https://tcgplayer.com',
      },
      285.00, 4.99,
      375.00, 340.00, 420.00,
      12
    ),
    createArbitrageOpportunity(
      {
        id: 'demo-3',
        name: 'Mew ex SAR',
        set: '151',
        condition: 'Near Mint',
        price: 48.50,
        shipping: 0,
        seller: 'PokemonHQ',
        platform: 'tcgplayer',
        url: 'https://tcgplayer.com',
      },
      48.50, 0,
      62.00, 55.00, 72.00,
      24
    ),
    createArbitrageOpportunity(
      {
        id: 'demo-4',
        name: 'Pikachu VMAX',
        set: 'Vivid Voltage',
        condition: 'Near Mint',
        price: 38.99,
        shipping: 2.99,
        seller: 'CardVault',
        platform: 'tcgplayer',
        url: 'https://tcgplayer.com',
      },
      38.99, 2.99,
      55.00, 48.00, 65.00,
      15
    ),
    createArbitrageOpportunity(
      {
        id: 'demo-5',
        name: 'Lugia V Alt Art',
        set: 'Silver Tempest',
        condition: 'Lightly Played',
        price: 145.00,
        shipping: 0,
        seller: 'RareFinds',
        platform: 'tcgplayer',
        url: 'https://tcgplayer.com',
      },
      145.00, 0,
      185.00, 165.00, 210.00,
      9
    ),
  ];
  
  return demos.sort((a, b) => b.netProfit - a.netProfit);
}
