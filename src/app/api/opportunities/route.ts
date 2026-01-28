import { NextResponse } from 'next/server';
import { generateMockOpportunities, getDemoOpportunities } from '@/lib/mock-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const query = searchParams.get('query');
  const minProfit = searchParams.get('minProfit');
  const minROI = searchParams.get('minROI');
  const sortBy = searchParams.get('sortBy') || 'profit';
  const demo = searchParams.get('demo');
  
  // Get opportunities (demo or generated)
  let opportunities = demo === 'true' 
    ? getDemoOpportunities() 
    : generateMockOpportunities(30);
  
  // Filter by search query
  if (query) {
    const lowerQuery = query.toLowerCase();
    opportunities = opportunities.filter(opp => 
      opp.card.name.toLowerCase().includes(lowerQuery) ||
      opp.card.set.toLowerCase().includes(lowerQuery)
    );
  }
  
  // Filter by minimum profit
  if (minProfit) {
    const minProfitNum = parseFloat(minProfit);
    opportunities = opportunities.filter(opp => opp.netProfit >= minProfitNum);
  }
  
  // Filter by minimum ROI
  if (minROI) {
    const minROINum = parseFloat(minROI);
    opportunities = opportunities.filter(opp => opp.roi >= minROINum);
  }
  
  // Sort
  opportunities.sort((a, b) => {
    switch (sortBy) {
      case 'profit':
        return b.netProfit - a.netProfit;
      case 'roi':
        return b.roi - a.roi;
      case 'confidence':
        return b.confidence - a.confidence;
      case 'recent':
        return b.createdAt.getTime() - a.createdAt.getTime();
      default:
        return b.netProfit - a.netProfit;
    }
  });
  
  return NextResponse.json({
    opportunities,
    total: opportunities.length,
    filters: {
      query,
      minProfit,
      minROI,
      sortBy,
    },
  });
}
