import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  ebayUserId?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  ebayConnected: boolean;
  user: UserProfile | null;
  isLoading: boolean;
  
  // Actions
  login: (user: UserProfile) => void;
  logout: () => void;
  setEbayConnected: (connected: boolean) => void;
  setLoading: (loading: boolean) => void;
  updateUser: (updates: Partial<UserProfile>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      ebayConnected: false,
      user: null,
      isLoading: false,

      login: (user: UserProfile) => {
        set({
          isAuthenticated: true,
          user,
          isLoading: false,
        });
      },

      logout: () => {
        set({
          isAuthenticated: false,
          ebayConnected: false,
          user: null,
          isLoading: false,
        });
        
        // Clear other stores if needed
        localStorage.removeItem('dealflow-app-store');
        localStorage.removeItem('dealflow-ui-store');
      },

      setEbayConnected: (connected: boolean) => {
        set({ ebayConnected: connected });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      updateUser: (updates: Partial<UserProfile>) => {
        const { user } = get();
        if (user) {
          set({
            user: { ...user, ...updates },
          });
        }
      },
    }),
    {
      name: 'dealflow-auth-store',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        ebayConnected: state.ebayConnected,
        user: state.user,
      }),
    },
  ),
);