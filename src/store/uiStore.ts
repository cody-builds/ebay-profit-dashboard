import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TransactionFilters } from '@/lib/types';

interface UIState {
  sidebarOpen: boolean;
  currentView: string;
  filters: TransactionFilters;
  searchQuery: string;
  selectedTransactions: string[];
  bulkEditMode: boolean;
  
  // Modal states
  showCostEditor: boolean;
  showExportDialog: boolean;
  showDeleteConfirm: boolean;
  showSyncDialog: boolean;
  
  // Actions
  setSidebarOpen: (open: boolean) => void;
  setCurrentView: (view: string) => void;
  updateFilters: (filters: Partial<TransactionFilters>) => void;
  resetFilters: () => void;
  setSearchQuery: (query: string) => void;
  toggleTransactionSelection: (id: string) => void;
  selectAllTransactions: (ids: string[]) => void;
  clearTransactionSelection: () => void;
  setBulkEditMode: (enabled: boolean) => void;
  
  // Modal actions
  setShowCostEditor: (show: boolean) => void;
  setShowExportDialog: (show: boolean) => void;
  setShowDeleteConfirm: (show: boolean) => void;
  setShowSyncDialog: (show: boolean) => void;
}

const defaultFilters: TransactionFilters = {
  sortBy: 'soldDate',
  sortOrder: 'desc',
};

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      sidebarOpen: false,
      currentView: 'dashboard',
      filters: defaultFilters,
      searchQuery: '',
      selectedTransactions: [],
      bulkEditMode: false,
      
      // Modal states
      showCostEditor: false,
      showExportDialog: false,
      showDeleteConfirm: false,
      showSyncDialog: false,

      setSidebarOpen: (open: boolean) => {
        set({ sidebarOpen: open });
      },

      setCurrentView: (view: string) => {
        set({ currentView: view });
      },

      updateFilters: (newFilters: Partial<TransactionFilters>) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        }));
      },

      resetFilters: () => {
        set({ filters: defaultFilters, searchQuery: '' });
      },

      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
        
        // Update filters with search
        const { filters } = get();
        set({
          filters: {
            ...filters,
            search: query || undefined,
          },
        });
      },

      toggleTransactionSelection: (id: string) => {
        set((state) => {
          const isSelected = state.selectedTransactions.includes(id);
          return {
            selectedTransactions: isSelected
              ? state.selectedTransactions.filter((tid) => tid !== id)
              : [...state.selectedTransactions, id],
          };
        });
      },

      selectAllTransactions: (ids: string[]) => {
        set({ selectedTransactions: ids });
      },

      clearTransactionSelection: () => {
        set({ selectedTransactions: [] });
      },

      setBulkEditMode: (enabled: boolean) => {
        set({ bulkEditMode: enabled });
        
        // Clear selection when disabling bulk edit
        if (!enabled) {
          set({ selectedTransactions: [] });
        }
      },

      // Modal actions
      setShowCostEditor: (show: boolean) => {
        set({ showCostEditor: show });
      },

      setShowExportDialog: (show: boolean) => {
        set({ showExportDialog: show });
      },

      setShowDeleteConfirm: (show: boolean) => {
        set({ showDeleteConfirm: show });
      },

      setShowSyncDialog: (show: boolean) => {
        set({ showSyncDialog: show });
      },
    }),
    {
      name: 'dealflow-ui-store',
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        currentView: state.currentView,
        filters: state.filters,
        bulkEditMode: state.bulkEditMode,
      }),
    },
  ),
);