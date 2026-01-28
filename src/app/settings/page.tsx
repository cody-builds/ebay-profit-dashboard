import { Suspense } from 'react';
import { SettingsHeader } from '@/components/settings/SettingsHeader';
import { EbayIntegration } from '@/components/settings/EbayIntegration';
import { SyncSettings } from '@/components/settings/SyncSettings';
import { DisplayPreferences } from '@/components/settings/DisplayPreferences';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { SettingsSkeleton } from '@/components/ui/SettingsSkeleton';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <SettingsHeader />

      <Suspense fallback={<SettingsSkeleton />}>
        <SettingsContent />
      </Suspense>
    </div>
  );
}

function SettingsContent() {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Left Column */}
      <div className="space-y-6">
        {/* eBay Integration */}
        <EbayIntegration />

        {/* Sync Settings */}
        <SyncSettings />
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        {/* Display Preferences */}
        <DisplayPreferences />

        {/* Notification Settings */}
        <NotificationSettings />
      </div>
    </div>
  );
}