'use client';

import { RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useSyncStatus } from '@/hooks/useSyncStatus';

export function SyncStatusWidget() {
  const { data: syncStatus, isLoading } = useSyncStatus();

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

  const getStatusConfig = () => {
    switch (syncStatus.status) {
      case 'synced':
        return {
          icon: CheckCircle,
          text: 'Synced',
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          iconColor: 'text-green-500',
        };
      case 'syncing':
        return {
          icon: RefreshCw,
          text: 'Syncing...',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700',
          iconColor: 'text-blue-500 animate-spin',
        };
      case 'error':
        return {
          icon: AlertCircle,
          text: 'Sync Error',
          bgColor: 'bg-red-50',
          textColor: 'text-red-700',
          iconColor: 'text-red-500',
        };
      default:
        return {
          icon: Clock,
          text: 'Pending',
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-700',
          iconColor: 'text-yellow-500',
        };
    }
  };

  const config = getStatusConfig();
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
        {syncStatus.lastSyncTime && (
          <span className="text-xs text-gray-500">
            {formatLastSync(syncStatus.lastSyncTime)}
          </span>
        )}
      </div>
      
      {/* Progress bar for syncing */}
      {syncStatus.status === 'syncing' && syncStatus.syncProgress !== undefined && (
        <div className="ml-2">
          <div className="w-16 bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${syncStatus.syncProgress}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 mt-1 block">
            {syncStatus.transactionsProcessed}/{syncStatus.transactionsTotal}
          </span>
        </div>
      )}
      
      {/* Error message tooltip */}
      {syncStatus.status === 'error' && syncStatus.error && (
        <div className="relative group">
          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
            {syncStatus.error}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black" />
          </div>
        </div>
      )}
    </div>
  );
}