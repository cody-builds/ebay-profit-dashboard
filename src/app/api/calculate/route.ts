import { NextResponse } from 'next/server';
import { calculateProfit, DEFAULT_FEES } from '@/lib/calculator';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { 
      buyPrice, 
      buyShipping = 0, 
      sellPrice,
      customFees 
    } = body;
    
    if (typeof buyPrice !== 'number' || typeof sellPrice !== 'number') {
      return NextResponse.json(
        { error: 'buyPrice and sellPrice are required numbers' },
        { status: 400 }
      );
    }
    
    const fees = customFees || DEFAULT_FEES;
    const result = calculateProfit(buyPrice, buyShipping, sellPrice, fees);
    
    return NextResponse.json({
      success: true,
      calculation: {
        input: {
          buyPrice,
          buyShipping,
          sellPrice,
        },
        fees: {
          ebayFinalValuePercent: `${(fees.ebayFinalValuePercent * 100).toFixed(2)}%`,
          ebayTransactionFee: fees.ebayTransactionFee,
          estimatedShipping: fees.estimatedShipping,
        },
        result: {
          totalBuyCost: Number(result.totalBuyCost.toFixed(2)),
          grossProfit: Number(result.grossProfit.toFixed(2)),
          ebayFees: Number(result.ebayFees.toFixed(2)),
          shippingCost: Number(result.shippingCost.toFixed(2)),
          totalFees: Number((result.ebayFees + result.shippingCost).toFixed(2)),
          netProfit: Number(result.netProfit.toFixed(2)),
          roi: Number(result.roi.toFixed(2)),
          profitMargin: Number(result.profitMargin.toFixed(2)),
        },
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

export async function GET() {
  // Return fee information
  return NextResponse.json({
    fees: {
      ebayFinalValuePercent: `${(DEFAULT_FEES.ebayFinalValuePercent * 100).toFixed(2)}%`,
      ebayTransactionFee: `$${DEFAULT_FEES.ebayTransactionFee.toFixed(2)}`,
      estimatedShipping: `$${DEFAULT_FEES.estimatedShipping.toFixed(2)} (PWE)`,
      note: 'eBay trading cards category uses 13.25% final value fee + $0.30 per transaction',
    },
    shippingOptions: {
      pwe: { cost: 1.50, description: 'Plain White Envelope with toploader' },
      bubble: { cost: 4.50, description: 'Bubble mailer with tracking' },
      bmwt: { cost: 5.50, description: 'Bubble Mailer with Tracking (recommended for $20+)' },
    },
  });
}
