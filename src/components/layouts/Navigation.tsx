'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  CreditCard, 
  TrendingUp, 
  Settings, 
  Menu, 
  X,
  RefreshCw,
  Download
} from 'lucide-react';
import { useSyncStatus } from '@/hooks/useSyncStatus';

const navigationItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Transactions', href: '/transactions', icon: CreditCard },
  { name: 'Analytics', href: '/analytics', icon: TrendingUp },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: syncStatus, isLoading: isSyncLoading } = useSyncStatus();

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="bg-blue-600 rounded-lg p-2">
                <LayoutDashboard className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900">DealFlow</span>
            </Link>

            {/* Desktop Navigation Items */}
            <div className="hidden md:flex items-center space-x-8">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== '/' && pathname.startsWith(item.href));
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Sync Status & Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <SyncStatusIndicator 
                status={syncStatus} 
                isLoading={isSyncLoading} 
              />
              
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-50">
                <Download className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-50"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 pt-2 pb-4 space-y-1">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== '/' && pathname.startsWith(item.href));
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              <div className="pt-4 mt-4 border-t">
                <SyncStatusIndicator 
                  status={syncStatus} 
                  isLoading={isSyncLoading}
                  mobile 
                />
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

function SyncStatusIndicator({ 
  status, 
  isLoading, 
  mobile = false 
}: { 
  status: any; 
  isLoading: boolean; 
  mobile?: boolean; 
}) {
  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${mobile ? 'px-3 py-2' : ''}`}>
        <RefreshCw className="h-4 w-4 text-gray-400 animate-spin" />
        <span className="text-sm text-gray-500">Checking sync...</span>
      </div>
    );
  }

  if (!status) {
    return (
      <div className={`flex items-center space-x-2 ${mobile ? 'px-3 py-2' : ''}`}>
        <div className="h-2 w-2 bg-gray-300 rounded-full" />
        <span className="text-sm text-gray-500">No sync data</span>
      </div>
    );
  }

  const syncColor = status.status === 'synced' ? 'green' : 
                   status.status === 'syncing' ? 'yellow' : 'red';
  const syncText = status.status === 'synced' ? 'Synced' : 
                  status.status === 'syncing' ? 'Syncing...' : 'Sync Error';

  return (
    <div className={`flex items-center space-x-2 ${mobile ? 'px-3 py-2' : ''}`}>
      <div 
        className={`h-2 w-2 rounded-full ${
          syncColor === 'green' ? 'bg-green-500' :
          syncColor === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
        }`} 
      />
      <span className="text-sm text-gray-600">{syncText}</span>
      {status.lastSyncTime && (
        <span className="text-xs text-gray-400">
          {new Date(status.lastSyncTime).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}