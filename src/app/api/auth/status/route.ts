import { NextRequest, NextResponse } from 'next/server';
import { StorageService } from '@/lib/storage/storage-service';
import { createEbayClient } from '@/lib/ebay/client';

export async function GET(request: NextRequest) {
  try {
    const storageService = new StorageService();
    const settings = await storageService.getSettings();

    if (!settings?.ebayTokens) {
      return NextResponse.json({
        success: true,
        data: {
          isAuthenticated: false,
          ebayConnected: false,
          tokenExpiry: null,
        },
        metadata: {
          timestamp: new Date().toISOString(),
        },
      });
    }

    const { ebayTokens } = settings;
    const now = new Date();
    const isTokenExpired = now >= ebayTokens.expiresAt;

    // If token is expired but we have a refresh token, attempt refresh
    if (isTokenExpired && ebayTokens.refreshToken) {
      try {
        const ebayClient = createEbayClient();
        const newTokens = await ebayClient.refreshAccessToken(ebayTokens.refreshToken);
        
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
            isAuthenticated: true,
            ebayConnected: true,
            tokenExpiry: newTokens.expiresAt.toISOString(),
            tokenRefreshed: true,
          },
          metadata: {
            timestamp: new Date().toISOString(),
          },
        });
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        
        return NextResponse.json({
          success: true,
          data: {
            isAuthenticated: false,
            ebayConnected: false,
            tokenExpiry: ebayTokens.expiresAt.toISOString(),
            tokenExpired: true,
            requiresReauth: true,
          },
          metadata: {
            timestamp: new Date().toISOString(),
          },
        });
      }
    }

    // Validate token with eBay API
    let isTokenValid = false;
    if (!isTokenExpired) {
      try {
        const ebayClient = createEbayClient();
        isTokenValid = await ebayClient.validateToken(ebayTokens.accessToken);
      } catch (error) {
        console.warn('Token validation failed:', error);
        isTokenValid = false;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        isAuthenticated: isTokenValid,
        ebayConnected: isTokenValid,
        tokenExpiry: ebayTokens.expiresAt.toISOString(),
        tokenExpired: isTokenExpired,
        requiresReauth: !isTokenValid,
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error checking auth status:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'AUTH_STATUS_ERROR',
          message: 'Failed to check authentication status',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}