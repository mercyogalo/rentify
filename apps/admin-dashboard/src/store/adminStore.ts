import { create } from 'zustand';
import {
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import type { User, AdminStats } from '@rentify/shared-types';
import { auth, isFirebaseConfigured } from '../services/firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

interface AdminState {
  token: string | null;
  user: User | null;
  stats: AdminStats | null;
  users: User[];
  agents: (User & { listingCount: number })[];
  listings: { id: string; title: string; price: number; status: string; city: string; agentName?: string }[];
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  fetchStats: () => Promise<void>;
  fetchUsers: (role?: string) => Promise<void>;
  fetchAgents: () => Promise<void>;
  fetchListings: () => Promise<void>;
  suspendUser: (id: string, isSuspended: boolean) => Promise<void>;
  verifyAgent: (id: string, isVerified: boolean) => Promise<void>;
  deleteListing: (id: string) => Promise<void>;
}

async function api<T>(path: string, token: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

const mockStats: AdminStats = {
  totalUsers: 1240,
  totalAgents: 86,
  totalListings: 342,
  listingsByStatus: { available: 210, taken: 98, pending: 34 },
  newSignupsThisWeek: 47,
  newSignupsThisMonth: 183,
  messagesSentToday: 256,
  userGrowth: [
    { date: '2025-07-01', count: 12 },
    { date: '2025-07-05', count: 18 },
    { date: '2025-07-10', count: 25 },
    { date: '2025-07-15', count: 31 },
    { date: '2025-07-20', count: 47 },
  ],
  listingsByCity: [
    { city: 'Austin', count: 120 },
    { city: 'Dallas', count: 85 },
    { city: 'Houston', count: 72 },
    { city: 'Round Rock', count: 45 },
  ],
  listingsByPropertyType: [
    { type: 'apartment', count: 140 },
    { type: 'house', count: 95 },
    { type: 'condo', count: 55 },
    { type: 'townhouse', count: 52 },
  ],
  mostActiveAgents: [
    { id: '1', name: 'Sarah Mitchell', listingCount: 18, responseRate: 92 },
    { id: '2', name: 'James Chen', listingCount: 14, responseRate: 88 },
    { id: '3', name: 'Maria Lopez', listingCount: 11, responseRate: 85 },
  ],
};

async function loginAndVerifyAdmin(email: string, password: string): Promise<{ token: string; user: User }> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const token = await cred.user.getIdToken();
  const { user } = await api<{ user: User }>('/api/auth/me', token);
  if (user.role !== 'admin') {
    await signOut(auth);
    throw new Error('Admin access only');
  }
  return { token, user };
}

export const useAdminStore = create<AdminState>((set, get) => ({
  token: isFirebaseConfigured ? null : 'mock-token',
  user: null,
  stats: null,
  users: [],
  agents: [],
  listings: [],

  login: async (email, password) => {
    if (!isFirebaseConfigured) {
      set({ token: 'mock-token', user: { id: 'admin', name: 'Admin', email, role: 'admin', createdAt: '', isSuspended: false } });
      return;
    }
    const { token, user } = await loginAndVerifyAdmin(email, password);
    set({ token, user });
  },

  loginWithGoogle: async () => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    const token = await cred.user.getIdToken();
    const { user } = await api<{ user: User }>('/api/auth/me', token);
    if (user.role !== 'admin') {
      await signOut(auth);
      throw new Error('Admin access only');
    }
    set({ token, user });
  },

  logout: () => {
    if (isFirebaseConfigured) signOut(auth);
    set({ token: null, user: null, stats: null });
  },

  fetchStats: async () => {
    const { token } = get();
    if (!token || token === 'mock-token') {
      set({ stats: mockStats });
      return;
    }
    try {
      const { stats } = await api<{ stats: AdminStats }>('/api/admin/stats', token);
      set({ stats });
    } catch {
      set({ stats: mockStats });
    }
  },

  fetchUsers: async (role) => {
    const { token } = get();
    if (!token || token === 'mock-token') return;
    const q = role ? `?role=${role}` : '';
    const { users } = await api<{ users: User[] }>(`/api/admin/users${q}`, token);
    set({ users });
  },

  fetchAgents: async () => {
    const { token } = get();
    if (!token || token === 'mock-token') return;
    const { agents } = await api<{ agents: (User & { listingCount: number })[] }>('/api/admin/agents', token);
    set({ agents });
  },

  fetchListings: async () => {
    const { token } = get();
    if (!token || token === 'mock-token') return;
    const { listings } = await api<{ listings: AdminState['listings'] }>('/api/admin/listings', token);
    set({ listings });
  },

  suspendUser: async (id, isSuspended) => {
    const { token } = get();
    if (!token) return;
    await api(`/api/admin/users/${id}/suspend`, token, {
      method: 'PATCH',
      body: JSON.stringify({ isSuspended }),
    });
    get().fetchUsers();
  },

  verifyAgent: async (id, isVerified) => {
    const { token } = get();
    if (!token) return;
    await api(`/api/admin/agents/${id}/verify`, token, {
      method: 'PATCH',
      body: JSON.stringify({ isVerified }),
    });
    get().fetchAgents();
  },

  deleteListing: async (id) => {
    const { token } = get();
    if (!token) return;
    await api(`/api/admin/listings/${id}`, token, { method: 'DELETE' });
    get().fetchListings();
  },
}));
