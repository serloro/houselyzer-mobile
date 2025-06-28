import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Property, Settings, AppState } from '@/types';
import { mockProperties } from '@/utils/mockData';

interface StoreActions {
  addProperty: (property: Property) => void;
  updateProperty: (id: string, updates: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
  toggleFavorite: (id: string) => void;
  setSearchTerm: (term: string) => void;
  setFilterType: (type: string) => void;
  setSortBy: (sort: string) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearData: () => void;
  clearMarketDataCache: () => void;
}

const defaultSettings: Settings = {
  currency: 'USD',
  defaultLoanTerm: 30,
  defaultInterestRate: 6.5,
  notifications: true,
  darkMode: false,
  measurementUnit: 'sqft',
  language: 'es',
  marketDataLocation: 'New York, NY',
  rapidApiKey: undefined,
};

export const useStore = create<AppState & StoreActions>()(
  persist(
    (set, get) => ({
      // State
      properties: mockProperties,
      favorites: [],
      settings: defaultSettings,
      searchTerm: '',
      filterType: 'all',
      sortBy: 'price-desc',
      isLoading: false,
      error: null,
      marketData: null,
      marketDataLoading: false,

      // Actions
      addProperty: (property) =>
        set((state) => ({
          properties: [...state.properties, property],
        })),

      updateProperty: (id, updates) =>
        set((state) => ({
          properties: state.properties.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
          ),
        })),

      deleteProperty: (id) =>
        set((state) => ({
          properties: state.properties.filter((p) => p.id !== id),
          favorites: state.favorites.filter((p) => p.id !== id),
        })),

      toggleFavorite: (id) =>
        set((state) => {
          const property = state.properties.find((p) => p.id === id);
          if (!property) return state;

          const updatedProperty = { ...property, isFavorite: !property.isFavorite };
          const updatedProperties = state.properties.map((p) =>
            p.id === id ? updatedProperty : p
          );

          const updatedFavorites = updatedProperty.isFavorite
            ? [...state.favorites, updatedProperty]
            : state.favorites.filter((p) => p.id !== id);

          return {
            properties: updatedProperties,
            favorites: updatedFavorites,
          };
        }),

      setSearchTerm: (term) => set({ searchTerm: term }),
      setFilterType: (type) => set({ filterType: type }),
      setSortBy: (sort) => set({ sortBy: sort }),

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      clearMarketDataCache: () => {
        console.log('🧹 Market data cache cleared from store');
      },

      clearData: () =>
        set({
          properties: [],
          favorites: [],
          searchTerm: '',
          filterType: 'all',
          sortBy: 'price-desc',
          marketData: null,
        }),
    }),
    {
      name: 'houselyzer-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        properties: state.properties,
        favorites: state.favorites,
        settings: state.settings,
        marketData: state.marketData,
      }),
    }
  )
);