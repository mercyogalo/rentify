import type { ListingStatus, PropertyType, UserRole } from '@rentify/shared-types';
import { Timestamp } from 'firebase-admin/firestore';

export interface FirestoreUser {
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  isSuspended: boolean;
  agencyName?: string;
  bio?: string;
  licenseNumber?: string;
  rating: number;
  isVerified: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirestoreListing {
  agentId: string;
  title: string;
  description: string;
  images: string[];
  price: number;
  location: string;
  propertyType: PropertyType;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  status: ListingStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirestoreConversation {
  userId: string;
  agentId: string;
  listingId?: string;
  lastMessage?: string;
  lastMessageAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirestoreMessage {
  conversationId: string;
  senderId: string;
  text: string;
  read: boolean;
  createdAt: Timestamp;
}
