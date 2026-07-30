import { Timestamp } from 'firebase-admin/firestore';
import type { User, Listing, Conversation, Message } from '@rentify/shared-types';
import type {
  FirestoreUser,
  FirestoreListing,
  FirestoreConversation,
  FirestoreMessage,
} from '../types/firestore';

function tsToIso(ts?: Timestamp | null): string {
  if (!ts) return new Date().toISOString();
  return ts.toDate().toISOString();
}

export function toPublicUser(id: string, data: FirestoreUser): User {
  return {
    id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    role: data.role,
    avatar: data.avatar,
    createdAt: tsToIso(data.createdAt),
    isSuspended: data.isSuspended,
    agencyName: data.agencyName,
    bio: data.bio,
    licenseNumber: data.licenseNumber,
    rating: data.rating,
    isVerified: data.isVerified,
  };
}

export function normalizeLocation(
  location: FirestoreListing['location'] | { address?: string; city?: string }
): string {
  if (typeof location === 'string') return location;
  const parts = [location.address, location.city].filter(Boolean);
  return parts.join(', ');
}

export function serializeListing(
  id: string,
  data: FirestoreListing,
  agent?: Pick<User, 'id' | 'name' | 'avatar' | 'rating' | 'agencyName'>
): Listing {
  return {
    id,
    agentId: data.agentId,
    title: data.title,
    description: data.description,
    images: data.images,
    price: data.price,
    location: normalizeLocation(data.location as FirestoreListing['location'] | { address?: string; city?: string }),
    propertyType: data.propertyType,
    bedrooms: data.bedrooms,
    bathrooms: data.bathrooms,
    amenities: data.amenities,
    status: data.status,
    createdAt: tsToIso(data.createdAt),
    updatedAt: tsToIso(data.updatedAt),
    agent,
  };
}

export function serializeConversation(
  id: string,
  data: FirestoreConversation,
  extras?: Partial<Conversation>
): Conversation {
  return {
    id,
    userId: data.userId,
    agentId: data.agentId,
    listingId: data.listingId,
    lastMessage: data.lastMessage,
    lastMessageAt: data.lastMessageAt ? tsToIso(data.lastMessageAt) : undefined,
    ...extras,
  };
}

export function serializeMessage(id: string, data: FirestoreMessage): Message {
  return {
    id,
    conversationId: data.conversationId,
    senderId: data.senderId,
    text: data.text,
    createdAt: tsToIso(data.createdAt),
    read: data.read,
  };
}
