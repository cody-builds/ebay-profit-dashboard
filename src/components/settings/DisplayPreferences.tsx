'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { Select } from '@/components/ui/Select';
import { Monitor, DollarSign, Palette } from 'lucide-react';

interface DisplaySettings {
  defaultView: 'dashboard' | 'transactions' | 'analytics';
  currency: 'USD' | 'EUR' | 'GBP' | 'CAD';
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'MMM DD, YYYY';
  theme: 'light' | 'dark' | 'auto';
  compactMode: boolean;
  showProfitMargin: boolean;
  showDaysListed: boolean;
  hideItemCosts: boolean;
  rowsPerPage: 10 | 25 | 50 | 100;
  roundingPrecision: 0 | 1 | 2;
}

export function DisplayPreferences() {
  const [settings, setSettings] = useState<DisplaySettings>({
    defaultView: 'dashboard',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    theme: 'light',
    compactMode: false,
    showProfitMargin: true,
    showDaysListed: true,
    hideItemCosts: false,
    rowsPerPage: 25,
    roundingPrecision: 2,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings/display');
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings || settings);
      }
    } catch (error) {
      console.error('Failed to load display settings:', error);
    }
  };

  const handleSettingChange = (key: keyof DisplaySettings, value: string | number | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/settings/display', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });

      if (response.ok) {
        setHasUnsavedChanges(false);
        alert('Display settings saved successfully!');
        // Apply theme change if needed
        if (settings.theme !== 'auto') {
          document.documentElement.classList.toggle('dark', settings.theme === 'dark');
        }
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save display settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPreviewDate = (format: string) => {
    switch (format) {
      case 'MM/DD/YYYY':
        return '01/15/2024';
      case 'DD/MM/YYYY':
        return '15/01/2024';
      case 'YYYY-MM-DD':
        return '2024-01-15';
      case 'MMM DD, YYYY':
        return 'Jan 15, 2024';
      default:
        return '01/15/2024';
    }
  };

  const formatPreviewPrice = (precision: number) => {
    const price = 123.456;
    return price.toFixed(precision);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Display Preferences</h3>
      
      <div className="space-y-6">
        {/* Default View */}
        <div>
          <label className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Default Landing Page
          </label>
          <Select
            value={settings.defaultView}
            onValueChange={(value) => handleSettingChange('defaultView', value as DisplaySettings['defaultView'])}
          >
            <option value="dashboard">Dashboard Overview</option>
            <option value="transactions">Transactions List</option>
            <option value="analytics">Analytics & Reports</option>
          </Select>
          <p className="text-xs text-gray-500 mt-1">
            The page you&apos;ll see when opening the app
          </p>
        </div>

        {/* Currency & Formatting */}
        <div className="space-y-4 border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Currency & Formatting
          </h4>

          <div>
            <label className="text-sm font-medium text-gray-900 mb-2 block">Currency</label>
            <Select
              value={settings.currency}
              onValueChange={(value) => handleSettingChange('currency', value as DisplaySettings['currency'])}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CAD">CAD (C$)</option>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-900 mb-2 block">
              Date Format
            </label>
            <Select
              value={settings.dateFormat}
              onValueChange={(value) => handleSettingChange('dateFormat', value as DisplaySettings['dateFormat'])}
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY ({formatPreviewDate('MM/DD/YYYY')})</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY ({formatPreviewDate('DD/MM/YYYY')})</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD ({formatPreviewDate('YYYY-MM-DD')})</option>
              <option value="MMM DD, YYYY">MMM DD, YYYY ({formatPreviewDate('MMM DD, YYYY')})</option>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-900 mb-2 block">
              Price Precision
            </label>
            <Select
              value={settings.roundingPrecision.toString()}
              onValueChange={(value) => handleSettingChange('roundingPrecision', parseInt(value) as DisplaySettings['roundingPrecision'])}
            >
              <option value="0">No decimals (${formatPreviewPrice(0)})</option>
              <option value="1">1 decimal (${formatPreviewPrice(1)})</option>
              <option value="2">2 decimals (${formatPreviewPrice(2)})</option>
            </Select>
          </div>
        </div>

        {/* Theme */}
        <div className="space-y-4 border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </h4>

          <div>
            <label className="text-sm font-medium text-gray-900 mb-2 block">Theme</label>
            <Select
              value={settings.theme}
              onValueChange={(value) => handleSettingChange('theme', value as DisplaySettings['theme'])}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">System Default</option>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Compact Mode</label>
              <p className="text-sm text-gray-600">Reduce spacing and show more data per screen</p>
            </div>
            <Switch
              checked={settings.compactMode}
              onCheckedChange={(checked) => handleSettingChange('compactMode', checked)}
            />
          </div>
        </div>

        {/* Table Settings */}
        <div className="space-y-4 border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-900">Table Settings</h4>

          <div>
            <label className="text-sm font-medium text-gray-900 mb-2 block">
              Rows Per Page
            </label>
            <Select
              value={settings.rowsPerPage.toString()}
              onValueChange={(value) => handleSettingChange('rowsPerPage', parseInt(value) as DisplaySettings['rowsPerPage'])}
            >
              <option value="10">10 rows</option>
              <option value="25">25 rows</option>
              <option value="50">50 rows</option>
              <option value="100">100 rows</option>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">Show Profit Margin</label>
                <p className="text-sm text-gray-600">Display profit margin percentage in tables</p>
              </div>
              <Switch
                checked={settings.showProfitMargin}
                onCheckedChange={(checked) => handleSettingChange('showProfitMargin', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">Show Days Listed</label>
                <p className="text-sm text-gray-600">Display how long items took to sell</p>
              </div>
              <Switch
                checked={settings.showDaysListed}
                onCheckedChange={(checked) => handleSettingChange('showDaysListed', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">Hide Item Costs</label>
                <p className="text-sm text-gray-600">Hide item cost column for privacy</p>
              </div>
              <Switch
                checked={settings.hideItemCosts}
                onCheckedChange={(checked) => handleSettingChange('hideItemCosts', checked)}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 pt-4">
          <Button
            onClick={saveSettings}
            disabled={!hasUnsavedChanges || isLoading}
            className="w-full"
          >
            {isLoading ? 'Saving...' : 'Save Display Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
}