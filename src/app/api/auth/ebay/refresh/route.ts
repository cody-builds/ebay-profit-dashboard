import { NextRequest, NextResponse } from 'next/server';
import { StorageService } from '@/lib/storage/storage-service';
import { createEbayClient } from '@/lib/ebay/client';

export async function POST(request: NextRequest) {
  try {
    const storageService = new StorageService();
    const settings = await storageService.getSettings();

    if (!settings?.ebayTokens?.refreshToken) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NO_REFRESH_TOKEN',
            message: 'No refresh token available. Re-authentication required.',
            requiresReauth: true,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Attempt to refresh the token
    const ebayClient = createEbayClient();
    const newTokens = await ebayClient.refreshAccessToken(settings.ebayTokens.refreshToken);

    // Update settings with new tokens
    settings.ebayTokens = {
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
      expiresAt: newTokens.expiresAt,
    };
    settings.updatedAt = new Date();

    await storageService.saveSettings(settings);

    return NextResponse.json({
      success: true,
      data: {
        tokenRefreshed: true,
        expiresAt: newTokens.expiresAt.toISOString(),
        message: 'Access token refreshed successfully',
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Token refresh failed:', error);
    
    // Check if this is an authentication error that requires re-auth
    const isAuthError = error instanceof Error && 
      (error.message.includes('invalid_grant') || 
       error.message.includes('invalid_token') ||
       error.message.includes('401') ||
       error.message.includes('403'));

    return NextResponse.json(
      {
        success: false,
        error: {
          code: isAuthError ? 'REFRESH_TOKEN_INVALID' : 'TOKEN_REFRESH_ERROR',
          message: isAuthError 
            ? 'Refresh token is invalid. Re-authentication required.'
            : 'Failed to refresh access token. Please try again.',
          requiresReauth: isAuthError,
        },
        timestamp: new Date().toISOString(),
      },
      { status: isAuthError ? 401 : 500 }
    );
  }
}