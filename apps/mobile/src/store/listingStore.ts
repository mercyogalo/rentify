import { create } from 'zustand';
import type { Listing, ListingFilters, ListingStatus } from '@rentify/shared-types';
import { MOCK_LISTINGS } from '../data/mockData';
import { apiRequest } from '../services/api';
import { useAuthStore } from './authStore';

import { isFirebaseConfigured } from '../services/firebase';

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true' || !isFirebaseConfigured;

interface ListingState {
  listings: Listing[];
  favorites: string[];
  filters: ListingFilters;
  isLoading: boolean;
  fetchListings: () => Promise<void>;
  fetchAgentListings: () => Promise<void>;
  setFilters: (filters: Partial<ListingFilters>) => void;
  resetFilters: () => void;
  toggleFavorite: (id: string) => void;
  updateListingStatus: (id: string, status: ListingStatus) => void;
  addListing: (listing: Listing) => void;
  updateListing: (id: string, updates: Partial<Listing>) => void;
  deleteListing: (id: string) => void;
  getFilteredListings: () => Listing[];
  getFavoriteListings: () => Listing[];
}

const defaultFilters: ListingFilters = {
  includeTaken: false,
};

function applyFilters(listings: Listing[], filters: ListingFilters): Listing[] {
  return listings.filter((l) => {
    if (!filters.includeTaken && l.status !== 'available' && !filters.status) return false;
    if (filters.status && l.status !== filters.status) return false;
    if (filters.city && !l.location.city.toLowerCase().includes(filters.city.toLowerCase()))
      return false;
    if (filters.minPrice && l.price < filters.minPrice) return false;
    if (filters.maxPrice && l.price > filters.maxPrice) return false;
    if (filters.propertyType && l.propertyType !== filters.propertyType) return false;
    if (filters.bedrooms && l.bedrooms < filters.bedrooms) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const match =
        l.title.toLowerCase().includes(q) ||
        l.location.city.toLowerCase().includes(q) ||
        l.location.address.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });
}

export const useListingStore = create<ListingState>((set, get) => ({
  listings: USE_MOCK ? [...MOCK_LISTINGS] : [],
  favorites: USE_MOCK ? ['listing-1'] : [],
  filters: defaultFilters,
  isLoading: false,

  fetchListings: async () => {
    set({ isLoading: true });
    try {
      if (USE_MOCK) {
        set({ listings: [...MOCK_LISTINGS], isLoading: false });
        return;
      }
      const token = useAuthStore.getState().token;
      const { filters } = get();
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined) params.set(k, String(v));
      });
      const { listings } = await apiRequest<{ listings: Listing[] }>(
        `/api/listings?${params}`,
        { token: token || undefined }
      );
      set({ listings, isLoading: false });
    } catch {
      set({ listings: [...MOCK_LISTINGS], isLoading: false });
    }
  },

  fetchAgentListings: async () => {
    set({ isLoading: true });
    try {
      if (USE_MOCK) {
        const agentId = useAuthStore.getState().user?.id || 'agent-1';
        set({
          listings: MOCK_LISTINGS.filter((l) => l.agentId === agentId),
          isLoading: false,
        });
        return;
      }
      const token = useAuthStore.getState().token!;
      const { listings } = await apiRequest<{ listings: Listing[] }>(
        '/api/listings/mine/all',
        { token }
      );
      set({ listings, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  setFilters: (filters) =>
    set((s) => ({ filters: { ...s.filters, ...filters } })),

  resetFilters: () => set({ filters: defaultFilters }),

  toggleFavorite: (id) =>
    set((s) => ({
      favorites: s.favorites.includes(id)
        ? s.favorites.filter((f) => f !== id)
        : [...s.favorites, id],
    })),

  updateListingStatus: (id, status) =>
    set((s) => ({
      listings: s.listings.map((l) => (l.id === id ? { ...l, status } : l)),
    })),

  addListing: (listing) =>
    set((s) => ({ listings: [listing, ...s.listings] })),

  updateListing: (id, updates) =>
    set((s) => ({
      listings: s.listings.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    })),

  deleteListing: (id) =>
    set((s) => ({ listings: s.listings.filter((l) => l.id !== id) })),

  getFilteredListings: () => applyFilters(get().listings, get().filters),

  getFavoriteListings: () => {
    const { listings, favorites } = get();
    return listings.filter((l) => favorites.includes(l.id));
  },
}));
