import { create } from 'zustand';
import { SyncStatus } from '@/hooks/useSyncStatus';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface AppState {
  syncStatus: SyncStatus | null;
  lastSyncTime: Date | null;
  notifications: Notification[];
  isOnline: boolean;
  
  // Actions
  setSyncStatus: (status: SyncStatus) => void;
  setLastSyncTime: (time: Date) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  setOnlineStatus: (online: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  syncStatus: null,
  lastSyncTime: null,
  notifications: [],
  isOnline: true,

  setSyncStatus: (status: SyncStatus) => {
    set({ syncStatus: status });
    
    // Update last sync time if sync is successful
    if (status.status === 'synced' && status.lastSyncTime) {
      set({ lastSyncTime: new Date(status.lastSyncTime) });
    }
  },

  setLastSyncTime: (time: Date) => {
    set({ lastSyncTime: time });
  },

  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      read: false,
    };

    set((state) => ({
      notifications: [newNotification, ...state.notifications].slice(0, 50), // Keep only latest 50
    }));

    // Auto-remove success notifications after 5 seconds
    if (notification.type === 'success') {
      setTimeout(() => {
        get().removeNotification(newNotification.id);
      }, 5000);
    }
  },

  markNotificationRead: (id: string) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  },

  removeNotification: (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },

  setOnlineStatus: (online: boolean) => {
    set({ isOnline: online });
    
    if (!online) {
      get().addNotification({
        type: 'warning',
        title: 'Connection Lost',
        message: 'You are currently offline. Some features may not work properly.',
      });
    } else {
      get().addNotification({
        type: 'success',
        title: 'Connection Restored',
        message: 'You are back online.',
      });
    }
  },
}));