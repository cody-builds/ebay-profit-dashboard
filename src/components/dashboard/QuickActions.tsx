'use client';

import Link from 'next/link';
import { 
  Plus, 
  RefreshCw, 
  Download, 
  Settings,
  BarChart3,
  Calculator,
  Upload,
  FileText
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { useSyncStatus } from '@/hooks/useSyncStatus';
import { useState } from 'react';

export function QuickActions() {
  const addNotification = useAppStore((state) => state.addNotification);
  // EMERGENCY: Disable sync status to stop phishing flags
  // const { data: syncStatus } = useSyncStatus();
  const syncStatus = null;
  const [isManualSyncing, setIsManualSyncing] = useState(false);

  const handleManualSync = async () => {
    setIsManualSyncing(true);
    
    try {
      const response = await fetch('/api/sync/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to trigger sync');
      }

      addNotification({
        type: 'success',
        title: 'Sync Started',
        message: 'eBay transaction sync has been triggered successfully.',
      });
    } catch {
      addNotification({
        type: 'error',
        title: 'Sync Failed',
        message: 'Failed to start eBay sync. Please try again.',
      });
    } finally {
      setIsManualSyncing(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/analytics/export?format=csv');
      
      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `dealflow-transactions-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      addNotification({
        type: 'success',
        title: 'Export Complete',
        message: 'Transaction data has been exported successfully.',
      });
    } catch {
      addNotification({
        type: 'error',
        title: 'Export Failed',
        message: 'Failed to export transaction data. Please try again.',
      });
    }
  };

  const quickActionItems = [
    {
      name: 'Add Transaction',
      description: 'Manually add a transaction',
      href: '/transactions/new',
      icon: Plus,
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
      iconColor: 'text-blue-600',
    },
    {
      name: 'View Analytics',
      description: 'Detailed profit analysis',
      href: '/analytics',
      icon: BarChart3,
      color: 'bg-green-50 hover:bg-green-100 border-green-200',
      iconColor: 'text-green-600',
    },
    {
      name: 'Profit Calculator',
      description: 'Calculate potential profits',
      href: '/calculator',
      icon: Calculator,
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
      iconColor: 'text-purple-600',
    },
    {
      name: 'Settings',
      description: 'eBay integration & preferences',
      href: '/settings',
      icon: Settings,
      color: 'bg-gray-50 hover:bg-gray-100 border-gray-200',
      iconColor: 'text-gray-600',
    },
  ];

  const actionButtons = [
    {
      name: 'Sync eBay',
      description: 'Sync transactions',
      onClick: handleManualSync,
      icon: RefreshCw,
      disabled: isManualSyncing,
      loading: isManualSyncing,
    },
    {
      name: 'Export Data',
      description: 'Download CSV export',
      onClick: handleExport,
      icon: Download,
      disabled: false,
      loading: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Navigation */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        
        <div className="grid grid-cols-1 gap-3">
          {quickActionItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${item.color}`}
            >
              <div className={`p-2 rounded-lg bg-white ${item.iconColor}`}>
                <item.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
        
        <div className="space-y-3">
          {actionButtons.map((button) => (
            <button
              key={button.name}
              onClick={button.onClick}
              disabled={button.disabled}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                button.disabled
                  ? 'bg-gray-50 border-gray-200 cursor-not-allowed'
                  : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
              }`}
            >
              <div className={`p-2 rounded-lg bg-white ${
                button.disabled ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <button.icon 
                  className={`h-4 w-4 ${button.loading ? 'animate-spin' : ''}`} 
                />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className={`text-sm font-medium ${
                  button.disabled ? 'text-gray-400' : 'text-gray-900'
                }`}>
                  {button.name}
                </p>
                <p className={`text-xs ${
                  button.disabled ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  {button.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex items-center space-x-2 text-gray-600">
            <FileText className="h-4 w-4" />
            <span>Dashboard viewed: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}