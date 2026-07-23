import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import type { User, AuthResponse, RegisterRequest } from '@rentify/shared-types';
import { apiRequest } from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';

const TOKEN_KEY = 'rentify_token';
const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK !== 'false';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  hasSeenOnboarding: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  setHasSeenOnboarding: (value: boolean) => void;
  updateUser: (user: User) => void;
  mockLogin: (role: 'user' | 'agent') => void;
}

const mockUsers: Record<string, User> = {
  user: {
    id: 'user-demo',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    phone: '+1 555-0199',
    role: 'user',
    avatar: 'https://i.pravatar.cc/150?u=alex',
    createdAt: '2025-01-01T00:00:00Z',
    isSuspended: false,
  },
  agent: {
    id: 'agent-1',
    name: 'Sarah Mitchell',
    email: 'sarah@premierhomes.com',
    phone: '+1 555-0101',
    role: 'agent',
    avatar: 'https://i.pravatar.cc/150?u=sarah',
    createdAt: '2024-01-15T00:00:00Z',
    isSuspended: false,
    agencyName: 'Premier Homes Realty',
    bio: 'Licensed agent with 8+ years experience.',
    licenseNumber: 'RE-88421',
    rating: 4.8,
    isVerified: true,
  },
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isInitialized: false,
  hasSeenOnboarding: false,

  initialize: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token && !USE_MOCK) {
        const { user } = await apiRequest<{ user: User }>('/api/auth/me', { token });
        connectSocket(token);
        set({ user, token, isInitialized: true });
      } else {
        set({ isInitialized: true });
      }
    } catch {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      set({ isInitialized: true });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      if (USE_MOCK) {
        const role = email.includes('agent') ? 'agent' : 'user';
        const user = mockUsers[role];
        set({ user, token: 'mock-token', isLoading: false });
        return;
      }
      const res = await apiRequest<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      await SecureStore.setItemAsync(TOKEN_KEY, res.token);
      connectSocket(res.token);
      set({ user: res.user, token: res.token, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      if (USE_MOCK) {
        const user: User = {
          id: `user-${Date.now()}`,
          name: data.name,
          email: data.email,
          phone: data.phone,
          role: data.role,
          createdAt: new Date().toISOString(),
          isSuspended: false,
          agencyName: data.agencyName,
          licenseNumber: data.licenseNumber,
          bio: data.bio,
        };
        set({ user, token: 'mock-token', isLoading: false });
        return;
      }
      const res = await apiRequest<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      await SecureStore.setItemAsync(TOKEN_KEY, res.token);
      connectSocket(res.token);
      set({ user: res.user, token: res.token, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    disconnectSocket();
    set({ user: null, token: null });
  },

  setHasSeenOnboarding: (value) => set({ hasSeenOnboarding: value }),

  updateUser: (user) => set({ user }),

  mockLogin: (role) => {
    set({ user: mockUsers[role], token: 'mock-token' });
  },
}));
