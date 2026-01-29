import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { Profile } from '@/lib/supabase/types';

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  ebayUserId?: string;
  avatarUrl?: string;
  fullName?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  ebayConnected: boolean;
  user: UserProfile | null;
  supabaseUser: User | null;
  profile: Profile | null;
  isLoading: boolean;
  
  // Actions
  initialize: () => Promise<void>;
  login: (user: UserProfile) => void;
  logout: () => Promise<void>;
  setEbayConnected: (connected: boolean) => void;
  setLoading: (loading: boolean) => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  setSupabaseUser: (user: User | null, profile: Profile | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      ebayConnected: false,
      user: null,
      supabaseUser: null,
      profile: null,
      isLoading: true,

      initialize: async () => {
        set({ isLoading: true });

        try {
          // Check if Supabase is configured
          if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            console.log('Supabase not configured, skipping authentication');
            set({
              isAuthenticated: false,
              user: null,
              supabaseUser: null,
              profile: null,
              isLoading: false,
            });
            return;
          }

          const supabase = createClient();
          
          // Get current session
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            // Fetch user profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user!.id)
              .single();

            const userProfile: UserProfile = {
              id: session.user!.id,
              email: session.user!.email!,
              name: profile?.full_name || undefined,
              fullName: profile?.full_name || undefined,
              avatarUrl: profile?.avatar_url || undefined,
              ebayUserId: profile?.ebay_user_id || undefined,
            };

            set({
              isAuthenticated: true,
              user: userProfile,
              supabaseUser: session.user!,
              profile: profile || null,
              isLoading: false,
            });
          } else {
            set({
              isAuthenticated: false,
              user: null,
              supabaseUser: null,
              profile: null,
              isLoading: false,
            });
          }

          // Listen to auth changes
          supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
              // Fetch user profile
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user!.id)
                .single();

              const userProfile: UserProfile = {
                id: session.user!.id,
                email: session.user!.email!,
                name: profile?.full_name || undefined,
                fullName: profile?.full_name || undefined,
                avatarUrl: profile?.avatar_url || undefined,
                ebayUserId: profile?.ebay_user_id || undefined,
              };

              set({
                isAuthenticated: true,
                user: userProfile,
                supabaseUser: session.user!,
                profile: profile || null,
                isLoading: false,
              });
            } else if (event === 'SIGNED_OUT') {
              set({
                isAuthenticated: false,
                ebayConnected: false,
                user: null,
                supabaseUser: null,
                profile: null,
                isLoading: false,
              });
            }
          });
        } catch (error) {
          console.error('Error initializing auth:', error);
          set({ isLoading: false });
        }
      },

      login: (user: UserProfile) => {
        set({
          isAuthenticated: true,
          user,
          isLoading: false,
        });
      },

      logout: async () => {
        const supabase = createClient();
        
        set({ isLoading: true });
        
        try {
          await supabase.auth.signOut();
          
          set({
            isAuthenticated: false,
            ebayConnected: false,
            user: null,
            supabaseUser: null,
            profile: null,
            isLoading: false,
          });
          
          // Clear other stores if needed
          localStorage.removeItem('dealflow-app-store');
          localStorage.removeItem('dealflow-ui-store');
          localStorage.removeItem('dealflow-auth-store');
        } catch (error) {
          console.error('Error signing out:', error);
          set({ isLoading: false });
        }
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

      setSupabaseUser: (user: User | null, profile: Profile | null) => {
        if (user && profile) {
          const userProfile: UserProfile = {
            id: user.id,
            email: user.email!,
            name: profile.full_name || undefined,
            fullName: profile.full_name || undefined,
            avatarUrl: profile.avatar_url || undefined,
            ebayUserId: profile.ebay_user_id || undefined,
          };

          set({
            isAuthenticated: true,
            user: userProfile,
            supabaseUser: user,
            profile,
          });
        } else {
          set({
            isAuthenticated: false,
            user: null,
            supabaseUser: null,
            profile: null,
          });
        }
      },
    }),
    {
      name: 'dealflow-auth-store',
      partialize: (state) => ({
        // Don't persist Supabase user or profile - these should be fetched fresh
        isAuthenticated: state.isAuthenticated,
        ebayConnected: state.ebayConnected,
        user: state.user,
      }),
    },
  ),
);