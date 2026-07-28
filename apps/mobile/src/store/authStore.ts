import { create } from 'zustand';
import type { User, RegisterRequest } from '@rentify/shared-types';
import {
  registerWithEmail,
  loginWithEmail,
  loginWithGoogleIdToken,
  logoutFirebase,
  fetchProfile,
  getIdToken,
  subscribeAuth,
  isFirebaseConfigured,
} from '../services/firebaseAuth';
import { connectSocket, disconnectSocket } from '../services/socket';

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true' || !isFirebaseConfigured;

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  hasSeenOnboarding: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<{ isNew: boolean }>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  setHasSeenOnboarding: (value: boolean) => void;
  updateUser: (user: User) => void;
  refreshToken: () => Promise<string | null>;
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
    if (USE_MOCK) {
      set({ isInitialized: true });
      return;
    }

    return new Promise<void>((resolve) => {
      const unsub = subscribeAuth(async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const token = await firebaseUser.getIdToken();
            const user = await fetchProfile(token);
            connectSocket(token);
            set({ user, token, isInitialized: true });
          } catch {
            set({ user: null, token: null, isInitialized: true });
          }
        } else {
          set({ user: null, token: null, isInitialized: true });
        }
        resolve();
        unsub();
      });
    });
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      if (USE_MOCK) {
        const role = email.includes('agent') ? 'agent' : 'user';
        set({ user: mockUsers[role], token: 'mock-token', isLoading: false });
        return;
      }
      const { user, token } = await loginWithEmail(email, password);
      connectSocket(token);
      set({ user, token, isLoading: false });
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
      const { user, token } = await registerWithEmail(data);
      connectSocket(token);
      set({ user, token, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  loginWithGoogle: async (idToken) => {
    set({ isLoading: true });
    try {
      const { user, token, isNew } = await loginWithGoogleIdToken(idToken);
      connectSocket(token);
      set({ user, token, isLoading: false });
      return { isNew };
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    if (!USE_MOCK) await logoutFirebase();
    disconnectSocket();
    set({ user: null, token: null });
  },

  setHasSeenOnboarding: (value) => set({ hasSeenOnboarding: value }),

  updateUser: (user) => set({ user }),

  refreshToken: async () => {
    const token = await getIdToken();
    if (token) set({ token });
    return token;
  },
}));
