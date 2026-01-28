'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { Input } from '@/components/ui/Input';
import { Mail, Bell, AlertTriangle, TrendingUp, Clock } from 'lucide-react';

interface NotificationSettings {
  emailNotifications: boolean;
  email: string;
  pushNotifications: boolean;
  syncFailureAlerts: boolean;
  syncSuccessNotifications: boolean;
  profitThresholdAlerts: boolean;
  profitThreshold: number;
  dailySummary: boolean;
  weeklySummary: boolean;
  lowProfitAlerts: boolean;
  lowProfitThreshold: number;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>({
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
  });

  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings/notifications');
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings || settings);
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
  };

  const handleSettingChange = (key: keyof NotificationSettings, value: string | number | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const handleQuietHoursChange = (key: keyof NotificationSettings['quietHours'], value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      quietHours: { ...prev.quietHours, [key]: value }
    }));
    setHasUnsavedChanges(true);
  };

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/settings/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });

      if (response.ok) {
        setHasUnsavedChanges(false);
        alert('Notification settings saved successfully!');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save notification settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestEmail = async () => {
    if (!settings.email) {
      alert('Please enter an email address first.');
      return;
    }

    setTestingEmail(true);
    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: settings.email }),
      });

      if (response.ok) {
        alert('Test email sent! Check your inbox.');
      } else {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to send test email');
      }
    } catch (error) {
      console.error('Failed to send test email:', error);
      alert(`Failed to send test email: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setTestingEmail(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h3>
      
      <div className="space-y-6">
        {/* Email Notifications */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <label className="text-sm font-medium text-gray-900">Email Notifications</label>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
            />
          </div>

          {settings.emailNotifications && (
            <div className="space-y-3 pl-6">
              <div>
                <label className="text-sm font-medium text-gray-900 mb-2 block">
                  Email Address
                </label>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    value={settings.email}
                    onChange={(e) => handleSettingChange('email', e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1"
                  />
                  <Button
                    onClick={sendTestEmail}
                    disabled={!settings.email || testingEmail}
                    variant="outline"
                    size="sm"
                  >
                    {testingEmail ? 'Sending...' : 'Test'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Push Notifications */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <div>
                <label className="text-sm font-medium text-gray-900">Push Notifications</label>
                <p className="text-sm text-gray-600">Browser notifications when app is open</p>
              </div>
            </div>
            <Switch
              checked={settings.pushNotifications}
              onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
            />
          </div>
        </div>

        {/* Sync Alerts */}
        <div className="space-y-4 border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Sync Alerts
          </h4>

          <div className="space-y-3 pl-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">Sync Failure Alerts</label>
                <p className="text-sm text-gray-600">Get notified when eBay sync fails</p>
              </div>
              <Switch
                checked={settings.syncFailureAlerts}
                onCheckedChange={(checked) => handleSettingChange('syncFailureAlerts', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">Sync Success Notifications</label>
                <p className="text-sm text-gray-600">Get notified when sync completes successfully</p>
              </div>
              <Switch
                checked={settings.syncSuccessNotifications}
                onCheckedChange={(checked) => handleSettingChange('syncSuccessNotifications', checked)}
              />
            </div>
          </div>
        </div>

        {/* Profit Alerts */}
        <div className="space-y-4 border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Profit Alerts
          </h4>

          <div className="space-y-4 pl-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">High Profit Alerts</label>
                  <p className="text-sm text-gray-600">Get notified when a sale exceeds threshold</p>
                </div>
                <Switch
                  checked={settings.profitThresholdAlerts}
                  onCheckedChange={(checked) => handleSettingChange('profitThresholdAlerts', checked)}
                />
              </div>

              {settings.profitThresholdAlerts && (
                <div>
                  <label className="text-sm font-medium text-gray-900 mb-2 block">
                    Profit Threshold ($)
                  </label>
                  <Input
                    type="number"
                    value={settings.profitThreshold}
                    onChange={(e) => handleSettingChange('profitThreshold', parseFloat(e.target.value) || 0)}
                    placeholder="100"
                    min="1"
                    step="1"
                  />
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">Low Profit Alerts</label>
                  <p className="text-sm text-gray-600">Get notified when profit margin is low</p>
                </div>
                <Switch
                  checked={settings.lowProfitAlerts}
                  onCheckedChange={(checked) => handleSettingChange('lowProfitAlerts', checked)}
                />
              </div>

              {settings.lowProfitAlerts && (
                <div>
                  <label className="text-sm font-medium text-gray-900 mb-2 block">
                    Low Profit Threshold (%)
                  </label>
                  <Input
                    type="number"
                    value={settings.lowProfitThreshold}
                    onChange={(e) => handleSettingChange('lowProfitThreshold', parseFloat(e.target.value) || 0)}
                    placeholder="5"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Reports */}
        <div className="space-y-4 border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-900">Summary Reports</h4>

          <div className="space-y-3 pl-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">Daily Summary</label>
                <p className="text-sm text-gray-600">Daily profit and sales summary email</p>
              </div>
              <Switch
                checked={settings.dailySummary}
                onCheckedChange={(checked) => handleSettingChange('dailySummary', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">Weekly Summary</label>
                <p className="text-sm text-gray-600">Weekly performance report email</p>
              </div>
              <Switch
                checked={settings.weeklySummary}
                onCheckedChange={(checked) => handleSettingChange('weeklySummary', checked)}
              />
            </div>
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="space-y-4 border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <div>
                <label className="text-sm font-medium text-gray-900">Quiet Hours</label>
                <p className="text-sm text-gray-600">No notifications during specified hours</p>
              </div>
            </div>
            <Switch
              checked={settings.quietHours.enabled}
              onCheckedChange={(checked) => handleQuietHoursChange('enabled', checked)}
            />
          </div>

          {settings.quietHours.enabled && (
            <div className="grid grid-cols-2 gap-3 pl-6">
              <div>
                <label className="text-sm font-medium text-gray-900 mb-2 block">
                  Start Time
                </label>
                <Input
                  type="time"
                  value={settings.quietHours.start}
                  onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-900 mb-2 block">
                  End Time
                </label>
                <Input
                  type="time"
                  value={settings.quietHours.end}
                  onChange={(e) => handleQuietHoursChange('end', e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 pt-4">
          <Button
            onClick={saveSettings}
            disabled={!hasUnsavedChanges || isLoading}
            className="w-full"
          >
            {isLoading ? 'Saving...' : 'Save Notification Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
}