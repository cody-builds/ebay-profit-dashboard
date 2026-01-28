import { NextRequest, NextResponse } from 'next/server';

// Mock settings storage - in production, use a database
let syncSettings = {
  autoSync: true,
  syncFrequency: 2,
  syncHistoryDays: 30,
  trackListingLength: true,
  batchSize: 200,
};

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      settings: syncSettings,
    });
  } catch (error) {
    console.error('Failed to load sync settings:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SETTINGS_LOAD_ERROR',
          message: 'Failed to load sync settings',
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

    // Update settings (in production, save to database)
    syncSettings = { ...syncSettings, ...settings };

    return NextResponse.json({
      success: true,
      settings: syncSettings,
      message: 'Sync settings updated successfully',
    });
  } catch (error) {
    console.error('Failed to save sync settings:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SETTINGS_SAVE_ERROR',
          message: 'Failed to save sync settings',
        },
      },
      { status: 500 }
    );
  }
}