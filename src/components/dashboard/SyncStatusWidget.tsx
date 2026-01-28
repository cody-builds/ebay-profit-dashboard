'use client';

import { RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useSyncStatus } from '@/hooks/useSyncStatus';

export function SyncStatusWidget() {
  // EMERGENCY: Disable sync status to stop phishing flags
  // const { data: syncStatus, isLoading } = useSyncStatus();
  const syncStatus = null;
  const isLoading = false;

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
        <RefreshCw className="h-4 w-4 text-gray-400 animate-spin" />
        <span className="text-sm text-gray-500">Checking sync status...</span>
      </div>
    );
  }

  if (!syncStatus) {
    return (
      <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
        <AlertCircle className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-500">No sync data available</span>
      </div>
    );
  }

  // Since syncStatus is disabled, just show a default state
  const config = {
    icon: AlertCircle,
    text: 'Sync Disabled',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    iconColor: 'text-gray-500',
  };
  const StatusIcon = config.icon;

  const formatLastSync = (timestamp: Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className={`flex items-center space-x-2 rounded-lg px-3 py-2 ${config.bgColor}`}>
      <StatusIcon className={`h-4 w-4 ${config.iconColor}`} />
      <div className="flex flex-col">
        <span className={`text-sm font-medium ${config.textColor}`}>
          {config.text}
        </span>
      </div>
    </div>
  );
}