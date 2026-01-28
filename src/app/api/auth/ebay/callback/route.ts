import { NextRequest, NextResponse } from 'next/server';
import { createEbayClient, validateOAuthState } from '@/lib/ebay/client';
import { StorageService } from '@/lib/storage/storage-service';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    // Check for OAuth errors
    if (error) {
      console.error('eBay OAuth error:', error);
      return NextResponse.redirect(
        new URL(`/?error=oauth_error&message=${encodeURIComponent(error)}`, request.url)
      );
    }

    // Validate required parameters
    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/?error=missing_params&message=Missing authorization code or state', request.url)
      );
    }

    // Validate state parameter
    const storedState = request.cookies.get('ebay_oauth_state')?.value;
    if (!storedState || !validateOAuthState(state, storedState)) {
      return NextResponse.redirect(
        new URL('/?error=invalid_state&message=Invalid OAuth state parameter', request.url)
      );
    }

    // Exchange code for tokens
    const ebayClient = createEbayClient();
    const tokens = await ebayClient.exchangeCodeForTokens(code);

    // Save tokens to user settings
    const storageService = new StorageService();
    let settings = await storageService.getSettings();

    if (!settings) {
      // Create new settings
      settings = {
        id: crypto.randomUUID(),
        userId: 'current_user', // In production, get from session
        syncFrequency: 6, // 6 hours
        autoSync: true,
        syncHistoryDays: 90,
        defaultView: 'dashboard',
        currency: 'USD',
        dateFormat: 'MM/dd/yyyy',
        defaultShippingCost: 5.00,
        roundingPrecision: 2,
        emailNotifications: false,
        syncFailureAlerts: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    // Update settings with eBay tokens
    settings.ebayTokens = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
    };
    settings.updatedAt = new Date();

    await storageService.saveSettings(settings);

    // Clear OAuth state cookie
    const response = NextResponse.redirect(new URL('/?connected=true', request.url));
    response.cookies.delete('ebay_oauth_state');

    return response;
  } catch (error) {
    console.error('Error in eBay OAuth callback:', error);
    
    const errorMessage = encodeURIComponent(
      error instanceof Error ? error.message : 'Unknown error occurred'
    );
    
    return NextResponse.redirect(
      new URL(`/?error=oauth_callback_error&message=${errorMessage}`, request.url)
    );
  }
}