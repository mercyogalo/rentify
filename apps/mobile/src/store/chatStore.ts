import { create } from 'zustand';
import type { Conversation, Message } from '@rentify/shared-types';
import { MOCK_CONVERSATIONS, MOCK_MESSAGES } from '../data/mockData';
import { apiRequest } from '../services/api';
import { getSocket } from '../services/socket';
import { useAuthStore } from './authStore';

import { isFirebaseConfigured } from '../services/firebase';

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true' || !isFirebaseConfigured;

interface ChatState {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  typingIn: Record<string, boolean>;
  isLoading: boolean;
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  startConversation: (agentId: string, listingId?: string) => Promise<Conversation>;
  sendMessage: (conversationId: string, text: string) => Promise<void>;
  setTyping: (conversationId: string, isTyping: boolean) => void;
  addMessage: (message: Message) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: USE_MOCK ? [...MOCK_CONVERSATIONS] : [],
  messages: USE_MOCK ? ({ 'conv-1': [...MOCK_MESSAGES] } as Record<string, Message[]>) : {},
  typingIn: {},
  isLoading: false,

  fetchConversations: async () => {
    set({ isLoading: true });
    try {
      if (USE_MOCK) {
        set({ conversations: [...MOCK_CONVERSATIONS], isLoading: false });
        return;
      }
      const token = useAuthStore.getState().token!;
      const { conversations } = await apiRequest<{ conversations: Conversation[] }>(
        '/api/conversations',
        { token }
      );
      set({ conversations, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchMessages: async (conversationId) => {
    try {
      if (USE_MOCK) {
        set((s) => ({
          messages: {
            ...s.messages,
            [conversationId]: MOCK_MESSAGES.filter(
              (m) => m.conversationId === conversationId
            ),
          },
        }));
        return;
      }
      const token = useAuthStore.getState().token!;
      const { messages } = await apiRequest<{ messages: Message[] }>(
        `/api/conversations/${conversationId}/messages`,
        { token }
      );
      set((s) => ({ messages: { ...s.messages, [conversationId]: messages } }));
    } catch {
      /* keep existing */
    }
  },

  startConversation: async (agentId, listingId) => {
    if (USE_MOCK) {
      const existing = get().conversations.find(
        (c) => c.agentId === agentId && c.listingId === listingId
      );
      if (existing) return existing;

      const conv: Conversation = {
        id: `conv-${Date.now()}`,
        userId: useAuthStore.getState().user!.id,
        agentId,
        listingId,
        lastMessage: '',
        lastMessageAt: new Date().toISOString(),
      };
      set((s) => ({ conversations: [conv, ...s.conversations] }));
      return conv;
    }

    const token = useAuthStore.getState().token!;
    const { conversation } = await apiRequest<{ conversation: Conversation }>(
      '/api/conversations',
      {
        method: 'POST',
        token,
        body: JSON.stringify({ agentId, listingId }),
      }
    );
    set((s) => ({ conversations: [conversation, ...s.conversations] }));
    return conversation;
  },

  sendMessage: async (conversationId, text) => {
    const userId = useAuthStore.getState().user!.id;
    const msg: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: userId,
      text,
      createdAt: new Date().toISOString(),
      read: false,
    };

    set((s) => ({
      messages: {
        ...s.messages,
        [conversationId]: [...(s.messages[conversationId] || []), msg],
      },
      conversations: s.conversations.map((c) =>
        c.id === conversationId
          ? { ...c, lastMessage: text, lastMessageAt: msg.createdAt }
          : c
      ),
    }));

    if (!USE_MOCK) {
      const socket = getSocket();
      socket?.emit('send_message', { conversationId, text });
    }
  },

  setTyping: (conversationId, isTyping) =>
    set((s) => ({ typingIn: { ...s.typingIn, [conversationId]: isTyping } })),

  addMessage: (message) =>
    set((s) => {
      const existing = s.messages[message.conversationId] || [];
      if (existing.some((m) => m.id === message.id)) return s;
      return {
        messages: {
          ...s.messages,
          [message.conversationId]: [...existing, message],
        },
        conversations: s.conversations.map((c) =>
          c.id === message.conversationId
            ? {
                ...c,
                lastMessage: message.text,
                lastMessageAt: message.createdAt,
              }
            : c
        ),
      };
    }),
}));
