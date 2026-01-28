import { NextRequest, NextResponse } from 'next/server';
import { SupabaseStorageService } from '@/lib/storage/supabase-storage-service';

export async function GET() {
  try {
    const storageService = new SupabaseStorageService(true); // Server-side
    const userSettings = await storageService.getUserSettings();

    if (!userSettings) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SETTINGS_NOT_FOUND',
            message: 'User settings not found',
          },
        },
        { status: 404 }
      );
    }

    // Map user settings to display settings format
    const displaySettings = {
      defaultView: userSettings.defaultView,
      currency: userSettings.currency,
      dateFormat: userSettings.dateFormat,
      roundingPrecision: userSettings.roundingPrecision,
      defaultShippingCost: userSettings.defaultShippingCost,
      emailNotifications: userSettings.emailNotifications,
      syncFailureAlerts: userSettings.syncFailureAlerts,
    };

    return NextResponse.json({
      success: true,
      settings: displaySettings,
    });
  } catch (error) {
    console.error('Failed to load display settings:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SETTINGS_LOAD_ERROR',
          message: 'Failed to load display settings',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { settings } = await request.json();
    
    // Validate settings
    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_SETTINGS',
            message: 'Invalid settings provided',
          },
        },
        { status: 400 }
      );
    }

    const storageService = new SupabaseStorageService(true); // Server-side
    let userSettings = await storageService.getUserSettings();

    if (!userSettings) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SETTINGS_NOT_FOUND',
            message: 'User settings not found',
          },
        },
        { status: 404 }
      );
    }

    // Update user settings with new display settings
    const updatedSettings = {
      ...userSettings,
      defaultView: settings.defaultView || userSettings.defaultView,
      currency: settings.currency || userSettings.currency,
      dateFormat: settings.dateFormat || userSettings.dateFormat,
      roundingPrecision: settings.roundingPrecision !== undefined ? settings.roundingPrecision : userSettings.roundingPrecision,
      defaultShippingCost: settings.defaultShippingCost !== undefined ? settings.defaultShippingCost : userSettings.defaultShippingCost,
      emailNotifications: settings.emailNotifications !== undefined ? settings.emailNotifications : userSettings.emailNotifications,
      syncFailureAlerts: settings.syncFailureAlerts !== undefined ? settings.syncFailureAlerts : userSettings.syncFailureAlerts,
    };

    await storageService.saveUserSettings(updatedSettings);

    // Return updated display settings format
    const displaySettings = {
      defaultView: updatedSettings.defaultView,
      currency: updatedSettings.currency,
      dateFormat: updatedSettings.dateFormat,
      roundingPrecision: updatedSettings.roundingPrecision,
      defaultShippingCost: updatedSettings.defaultShippingCost,
      emailNotifications: updatedSettings.emailNotifications,
      syncFailureAlerts: updatedSettings.syncFailureAlerts,
    };

    return NextResponse.json({
      success: true,
      settings: displaySettings,
      message: 'Display settings updated successfully',
    });
  } catch (error) {
    console.error('Failed to save display settings:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SETTINGS_SAVE_ERROR',
          message: 'Failed to save display settings',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}