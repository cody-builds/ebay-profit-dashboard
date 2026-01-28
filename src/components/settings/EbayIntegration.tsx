'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ExternalLink, RefreshCw, CheckCircle, AlertCircle, Unlink } from 'lucide-react';

interface EbayTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export function EbayIntegration() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState<'checking' | 'connected' | 'expired' | 'disconnected'>('checking');
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [tokens, setTokens] = useState<EbayTokens | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/status');
      const data = await response.json();
      
      if (data.success && data.isConnected) {
        setIsConnected(true);
        setAuthStatus('connected');
        setTokens(data.tokens);
        setLastSync(data.lastSync ? new Date(data.lastSync) : null);
      } else {
        setIsConnected(false);
        setAuthStatus('disconnected');
      }
    } catch (error) {
      console.error('Failed to check auth status:', error);
      setAuthStatus('disconnected');
    }
  };

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/ebay/login', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        // Redirect to eBay OAuth
        window.location.href = data.authUrl;
      } else {
        throw new Error(data.error?.message || 'Failed to initiate OAuth');
      }
    } catch (error) {
      console.error('Failed to connect to eBay:', error);
      alert('Failed to connect to eBay. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your eBay account? This will stop automatic data syncing.')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/ebay/disconnect', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        setIsConnected(false);
        setAuthStatus('disconnected');
        setTokens(null);
        setLastSync(null);
      } else {
        throw new Error(data.error?.message || 'Failed to disconnect');
      }
    } catch (error) {
      console.error('Failed to disconnect from eBay:', error);
      alert('Failed to disconnect from eBay. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshToken = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/ebay/refresh', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        setTokens(data.tokens);
        setAuthStatus('connected');
        alert('Token refreshed successfully!');
      } else {
        throw new Error(data.error?.message || 'Failed to refresh token');
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
      alert('Failed to refresh token. You may need to reconnect your account.');
      setAuthStatus('expired');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = () => {
    switch (authStatus) {
      case 'connected':
        return <Badge variant="success" className="gap-1"><CheckCircle className="h-3 w-3" />Connected</Badge>;
      case 'expired':
        return <Badge variant="warning" className="gap-1"><AlertCircle className="h-3 w-3" />Token Expired</Badge>;
      case 'disconnected':
        return <Badge variant="error" className="gap-1"><Unlink className="h-3 w-3" />Disconnected</Badge>;
      default:
        return <Badge variant="default" className="gap-1"><RefreshCw className="h-3 w-3" />Checking...</Badge>;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">eBay Integration</h3>
        {getStatusBadge()}
      </div>

      <div className="space-y-4">
        <div className="text-sm text-gray-600">
          Connect your eBay account to automatically sync order data and calculate profits.
        </div>

        {isConnected ? (
          <div className="space-y-4">
            {/* Connection Info */}
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <div className="text-sm">
                  <p className="text-green-800 font-medium">eBay account connected successfully</p>
                  <p className="text-green-600 mt-1">
                    Your transactions will be automatically synced every hour.
                  </p>
                </div>
              </div>
            </div>

            {/* Token Info */}
            {tokens && (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                <div className="text-sm">
                  <p className="font-medium text-gray-900 mb-2">Token Information</p>
                  <div className="space-y-1 text-gray-600">
                    <p>Expires: {new Date(tokens.expiresAt).toLocaleString()}</p>
                    {lastSync && <p>Last Sync: {lastSync.toLocaleString()}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={handleRefreshToken}
                disabled={isLoading}
                size="sm"
                variant="outline"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh Token
              </Button>
              <Button
                onClick={handleDisconnect}
                disabled={isLoading}
                size="sm"
                variant="destructive"
              >
                <Unlink className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Not Connected State */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="text-yellow-800 font-medium">eBay account not connected</p>
                  <p className="text-yellow-700 mt-1">
                    Connect your eBay seller account to start tracking profits automatically.
                  </p>
                </div>
              </div>
            </div>

            {/* Connect Button */}
            <Button
              onClick={handleConnect}
              disabled={isLoading}
              className="w-full"
            >
              <ExternalLink className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Connecting...' : 'Connect eBay Account'}
            </Button>

            <div className="text-xs text-gray-500">
              <p className="font-medium mb-1">What we&apos;ll access:</p>
              <ul className="list-disc list-inside space-y-0.5 ml-2">
                <li>Order and transaction data</li>
                <li>Listing information</li>
                <li>Fee details</li>
              </ul>
              <p className="mt-2">
                We use secure OAuth 2.0 authentication. We never store your eBay password.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}