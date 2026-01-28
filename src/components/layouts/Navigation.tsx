'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  CreditCard, 
  TrendingUp, 
  Settings, 
  Menu, 
  X,
  RefreshCw,
  Download,
  User,
  LogOut,
  LogIn,
  UserPlus
} from 'lucide-react';
import { useSyncStatus } from '@/hooks/useSyncStatus';
import { useAuthStore } from '@/store/authStore';

interface SyncStatus {
  status: 'synced' | 'syncing' | 'error' | 'never_synced';
  lastSyncTime?: Date;
  nextSyncTime?: Date;
  syncProgress?: number;
  error?: string;
  transactionsProcessed?: number;
  transactionsTotal?: number;
}

const protectedNavigationItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Transactions', href: '/transactions', icon: CreditCard },
  { name: 'Analytics', href: '/analytics', icon: TrendingUp },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { data: syncStatus, isLoading: isSyncLoading } = useSyncStatus();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Don't show protected navigation on auth pages
  const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].includes(pathname);
  
  return (
    <>
      {/* Desktop Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href={isAuthenticated ? "/" : "/login"} className="flex items-center space-x-3">
              <div className="bg-blue-600 rounded-lg p-2">
                <LayoutDashboard className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900">DealFlow</span>
            </Link>

            {/* Desktop Navigation Items - Only show if authenticated and not on auth pages */}
            {isAuthenticated && !isAuthPage && (
              <div className="hidden md:flex items-center space-x-8">
                {protectedNavigationItems.map((item) => {
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
            )}

            {/* Right side actions */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Sync Status - Only show if authenticated */}
              {isAuthenticated && !isAuthPage && (
                <>
                  <SyncStatusIndicator 
                    status={syncStatus} 
                    isLoading={isSyncLoading} 
                  />
                  
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-50">
                    <Download className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* User Menu or Auth Buttons */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  >
                    <User className="h-5 w-5" />
                    <span className="text-sm font-medium">{user?.name || user?.email}</span>
                  </button>

                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border z-50">
                      <Link
                        href="/profile"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    href="/login"
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Sign Up</span>
                  </Link>
                </div>
              )}
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
              {/* Protected Navigation - Only if authenticated */}
              {isAuthenticated && !isAuthPage && protectedNavigationItems.map((item) => {
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
              
              {/* User Actions */}
              <div className="pt-4 mt-4 border-t">
                {isAuthenticated ? (
                  <>
                    <div className="px-3 py-2">
                      <p className="text-sm text-gray-600">Signed in as</p>
                      <p className="text-sm font-medium text-gray-900">{user?.name || user?.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      className="flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="h-5 w-5" />
                      <span>Profile</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 w-full text-left"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <LogIn className="h-5 w-5" />
                      <span>Sign In</span>
                    </Link>
                    <Link
                      href="/register"
                      className="flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <UserPlus className="h-5 w-5" />
                      <span>Sign Up</span>
                    </Link>
                  </>
                )}
                
                {/* Sync Status - Only if authenticated */}
                {isAuthenticated && !isAuthPage && (
                  <div className="pt-4 mt-4 border-t">
                    <SyncStatusIndicator 
                      status={syncStatus} 
                      isLoading={isSyncLoading}
                      mobile 
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Click outside handler for user menu */}
      {isUserMenuOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </>
  );
}

function SyncStatusIndicator({ 
  status, 
  isLoading, 
  mobile = false 
}: { 
  status: SyncStatus | undefined; 
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