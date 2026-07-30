import { create } from 'zustand';
import type { Listing, ListingFilters, ListingStatus } from '@rentify/shared-types';
import { MOCK_LISTINGS } from '../data/mockData';
import { apiRequest } from '../services/api';
import { useAuthStore } from './authStore';

import { isFirebaseConfigured } from '../services/firebase';

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true' || !isFirebaseConfigured;

export type ListingInput = {
  title: string;
  description: string;
  price: number;
  location: string;
  propertyType: Listing['propertyType'];
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  status: ListingStatus;
  images: string[];
};

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
  updateListingStatus: (id: string, status: ListingStatus) => Promise<void>;
  addListing: (data: ListingInput) => Promise<Listing>;
  updateListing: (id: string, updates: Partial<ListingInput>) => Promise<void>;
  deleteListing: (id: string) => Promise<void>;
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
    if (filters.city && !l.location.toLowerCase().includes(filters.city.toLowerCase()))
      return false;
    if (filters.minPrice && l.price < filters.minPrice) return false;
    if (filters.maxPrice && l.price > filters.maxPrice) return false;
    if (filters.propertyType && l.propertyType !== filters.propertyType) return false;
    if (filters.bedrooms && l.bedrooms < filters.bedrooms) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const match =
        l.title.toLowerCase().includes(q) ||
        l.location.toLowerCase().includes(q);
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

  updateListingStatus: async (id, status) => {
    if (!USE_MOCK) {
      const token = useAuthStore.getState().token!;
      await apiRequest(`/api/listings/${id}`, {
        method: 'PATCH',
        token,
        body: JSON.stringify({ status }),
      });
    }
    set((s) => ({
      listings: s.listings.map((l) => (l.id === id ? { ...l, status } : l)),
    }));
  },

  addListing: async (data) => {
    if (USE_MOCK) {
      const user = useAuthStore.getState().user!;
      const listing: Listing = {
        id: `listing-${Date.now()}`,
        agentId: user.id,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        agent: {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          rating: user.rating,
          agencyName: user.agencyName,
        },
      };
      set((s) => ({ listings: [listing, ...s.listings] }));
      return listing;
    }

    const token = useAuthStore.getState().token!;
    const { listing } = await apiRequest<{ listing: Listing }>('/api/listings', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    });
    set((s) => ({ listings: [listing, ...s.listings] }));
    return listing;
  },

  updateListing: async (id, updates) => {
    if (!USE_MOCK) {
      const token = useAuthStore.getState().token!;
      const { listing } = await apiRequest<{ listing: Listing }>(`/api/listings/${id}`, {
        method: 'PATCH',
        token,
        body: JSON.stringify(updates),
      });
      set((s) => ({
        listings: s.listings.map((l) => (l.id === id ? listing : l)),
      }));
      return;
    }

    set((s) => ({
      listings: s.listings.map((l) =>
        l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l
      ),
    }));
  },

  deleteListing: async (id) => {
    if (!USE_MOCK) {
      const token = useAuthStore.getState().token!;
      await apiRequest(`/api/listings/${id}`, { method: 'DELETE', token });
    }
    set((s) => ({ listings: s.listings.filter((l) => l.id !== id) }));
  },

  getFilteredListings: () => applyFilters(get().listings, get().filters),

  getFavoriteListings: () => {
    const { listings, favorites } = get();
    return listings.filter((l) => favorites.includes(l.id));
  },
}));
