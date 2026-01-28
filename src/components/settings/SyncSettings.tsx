'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { Select } from '@/components/ui/Select';
import { RefreshCw, Clock, Calendar, TrendingUp, AlertCircle } from 'lucide-react';

interface SyncSettings {
  autoSync: boolean;
  syncFrequency: number; // hours
  syncHistoryDays: number;
  trackListingLength: boolean;
  batchSize: number;
}

interface SyncStatus {
  isRunning: boolean;
  lastSync: Date | null;
  nextSync: Date | null;
  totalTransactions: number;
  newTransactions: number;
  errors: string[];
}

export function SyncSettings() {
  const [settings, setSettings] = useState<SyncSettings>({
    autoSync: true,
    syncFrequency: 2, // every 2 hours
    syncHistoryDays: 30,
    trackListingLength: true,
    batchSize: 200,
  });
  
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isRunning: false,
    lastSync: null,
    nextSync: null,
    totalTransactions: 0,
    newTransactions: 0,
    errors: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    loadSettings();
    loadSyncStatus();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings/sync');
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings || settings);
      }
    } catch (error) {
      console.error('Failed to load sync settings:', error);
    }
  };

  const loadSyncStatus = async () => {
    try {
      const response = await fetch('/api/sync/status');
      if (response.ok) {
        const data = await response.json();
        setSyncStatus({
          isRunning: data.isRunning || false,
          lastSync: data.lastSync ? new Date(data.lastSync) : null,
          nextSync: data.nextSync ? new Date(data.nextSync) : null,
          totalTransactions: data.totalTransactions || 0,
          newTransactions: data.newTransactions || 0,
          errors: data.errors || [],
        });
      }
    } catch (error) {
      console.error('Failed to load sync status:', error);
    }
  };

  const handleSettingChange = (key: keyof SyncSettings, value: string | number | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/settings/sync', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });

      if (response.ok) {
        setHasUnsavedChanges(false);
        alert('Sync settings saved successfully!');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save sync settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerManualSync = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/sync/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          daysBack: settings.syncHistoryDays,
          batchSize: settings.batchSize,
        }),
      });

      if (response.ok) {
        alert('Manual sync started! Check back in a few minutes.');
        loadSyncStatus();
      } else {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to start sync');
      }
    } catch (error) {
      console.error('Failed to trigger sync:', error);
      alert(`Failed to start sync: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Sync Settings</h3>
      
      <div className="space-y-6">
        {/* Auto Sync Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Automatic Sync</label>
              <p className="text-sm text-gray-600">Automatically sync eBay transactions</p>
            </div>
            <Switch
              checked={settings.autoSync}
              onCheckedChange={(checked) => handleSettingChange('autoSync', checked)}
            />
          </div>

          {settings.autoSync && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-900 mb-2 block">
                  Sync Frequency
                </label>
                <Select
                  value={settings.syncFrequency.toString()}
                  onValueChange={(value) => handleSettingChange('syncFrequency', parseInt(value))}
                >
                  <option value="1">Every hour</option>
                  <option value="2">Every 2 hours</option>
                  <option value="4">Every 4 hours</option>
                  <option value="6">Every 6 hours</option>
                  <option value="12">Every 12 hours</option>
                  <option value="24">Daily</option>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-900 mb-2 block">
                  Sync History (Days)
                </label>
                <Select
                  value={settings.syncHistoryDays.toString()}
                  onValueChange={(value) => handleSettingChange('syncHistoryDays', parseInt(value))}
                >
                  <option value="7">Last 7 days</option>
                  <option value="14">Last 14 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="60">Last 60 days</option>
                  <option value="90">Last 90 days</option>
                </Select>
              </div>
            </>
          )}
        </div>

        {/* Listing Length Tracking */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Track Listing Length</label>
              <p className="text-sm text-gray-600">Calculate average time items take to sell</p>
            </div>
            <Switch
              checked={settings.trackListingLength}
              onCheckedChange={(checked) => handleSettingChange('trackListingLength', checked)}
            />
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Advanced Settings</h4>
          
          <div>
            <label className="text-sm font-medium text-gray-900 mb-2 block">
              Batch Size
            </label>
            <Select
              value={settings.batchSize.toString()}
              onValueChange={(value) => handleSettingChange('batchSize', parseInt(value))}
            >
              <option value="50">50 transactions per batch</option>
              <option value="100">100 transactions per batch</option>
              <option value="200">200 transactions per batch</option>
              <option value="500">500 transactions per batch</option>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              Larger batches sync faster but may hit rate limits
            </p>
          </div>
        </div>

        {/* Sync Status */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900">Sync Status</h4>
            <Button
              onClick={loadSyncStatus}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh
            </Button>
          </div>

          <div className="space-y-3">
            {syncStatus.isRunning && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Sync in progress...
              </div>
            )}

            {syncStatus.lastSync && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                Last sync: {syncStatus.lastSync.toLocaleString()}
              </div>
            )}

            {syncStatus.nextSync && settings.autoSync && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                Next sync: {syncStatus.nextSync.toLocaleString()}
              </div>
            )}

            {syncStatus.totalTransactions > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <TrendingUp className="h-4 w-4" />
                {syncStatus.totalTransactions} total transactions
                {syncStatus.newTransactions > 0 && (
                  <span className="text-green-600">
                    ({syncStatus.newTransactions} new)
                  </span>
                )}
              </div>
            )}

            {syncStatus.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-red-800 font-medium">Recent sync errors:</p>
                    <ul className="text-red-700 mt-1 list-disc list-inside">
                      {syncStatus.errors.slice(0, 3).map((error, index) => (
                        <li key={index} className="truncate">{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 pt-4 flex gap-2">
          <Button
            onClick={saveSettings}
            disabled={!hasUnsavedChanges || isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Settings'}
          </Button>
          
          <Button
            onClick={triggerManualSync}
            variant="outline"
            disabled={isLoading || syncStatus.isRunning}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading || syncStatus.isRunning ? 'animate-spin' : ''}`} />
            Manual Sync
          </Button>
        </div>
      </div>
    </div>
  );
}