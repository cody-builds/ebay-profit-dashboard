'use client';

import { Button } from '@/components/ui/Button';
import { RefreshCw, Download, Settings } from 'lucide-react';
import { useState } from 'react';

export function TransactionsHeader() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Trigger manual sync
      const response = await fetch('/api/sync/trigger', {
        method: 'POST',
      });
      
      if (response.ok) {
        // Refresh the page after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to trigger sync:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/analytics/export');
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ebay-transactions-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export transactions:', error);
      alert('Failed to export transactions. Please try again.');
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <p className="text-gray-600 mt-1">
          Track and analyze your eBay sales performance
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Syncing...' : 'Sync eBay'}
        </Button>

        <Button
          onClick={handleExport}
          variant="outline"
          size="sm"
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>

        <Button
          onClick={() => window.location.href = '/settings'}
          variant="outline"
          size="sm"
        >
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>
    </div>
  );
}