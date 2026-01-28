import { NextRequest, NextResponse } from 'next/server';

// Mock settings storage - in production, use a database
let notificationSettings = {
  emailNotifications: false,
  email: '',
  pushNotifications: false,
  syncFailureAlerts: true,
  syncSuccessNotifications: false,
  profitThresholdAlerts: false,
  profitThreshold: 100,
  dailySummary: false,
  weeklySummary: false,
  lowProfitAlerts: false,
  lowProfitThreshold: 5,
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
  },
};

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      settings: notificationSettings,
    });
  } catch (error) {
    console.error('Failed to load notification settings:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SETTINGS_LOAD_ERROR',
          message: 'Failed to load notification settings',
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
    notificationSettings = { ...notificationSettings, ...settings };

    return NextResponse.json({
      success: true,
      settings: notificationSettings,
      message: 'Notification settings updated successfully',
    });
  } catch (error) {
    console.error('Failed to save notification settings:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SETTINGS_SAVE_ERROR',
          message: 'Failed to save notification settings',
        },
      },
      { status: 500 }
    );
  }
}