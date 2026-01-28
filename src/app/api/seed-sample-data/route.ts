import { NextResponse } from 'next/server';
import { seedSampleDataForUser, createDefaultUserSettings } from '@/lib/sample-data/seeder';

export async function POST() {
  try {
    // Seed sample transactions
    await seedSampleDataForUser();
    
    // Ensure default settings exist (should be handled by DB trigger)
    await createDefaultUserSettings();

    return NextResponse.json({
      success: true,
      message: 'Sample data seeded successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error seeding sample data:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SAMPLE_DATA_SEED_ERROR',
          message: 'Failed to seed sample data',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}