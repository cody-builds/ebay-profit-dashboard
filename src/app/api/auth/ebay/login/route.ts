import { NextRequest, NextResponse } from 'next/server';
import { createEbayClient, generateOAuthState } from '@/lib/ebay/client';

export async function GET(request: NextRequest) {
  try {
    // Generate secure state parameter
    const state = generateOAuthState();
    
    // Store state in session/cookie for validation (simplified for MVP)
    const response = NextResponse.redirect(createEbayClient().generateAuthURL(state));
    
    // Store state in an HTTP-only cookie for security
    response.cookies.set('ebay_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
    });

    return response;
  } catch (error) {
    console.error('Error initiating eBay OAuth:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'OAUTH_INIT_ERROR',
          message: 'Failed to initiate eBay authentication',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}