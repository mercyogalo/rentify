export type UserRole = 'user' | 'agent' | 'admin';

export type ListingStatus = 'available' | 'taken' | 'pending';

export type PropertyType =
  | 'apartment'
  | 'house'
  | 'condo'
  | 'townhouse'
  | 'studio'
  | 'other';

export interface Location {
  address: string;
  city: string;
  lat: number;
  lng: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  isSuspended: boolean;
  agencyName?: string;
  bio?: string;
  licenseNumber?: string;
  rating?: number;
  isVerified?: boolean;
}

export interface Listing {
  id: string;
  agentId: string;
  title: string;
  description: string;
  images: string[];
  price: number;
  location: Location;
  propertyType: PropertyType;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
  agent?: Pick<User, 'id' | 'name' | 'avatar' | 'rating' | 'agencyName'>;
}

export interface Conversation {
  id: string;
  userId: string;
  agentId: string;
  listingId?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  user?: Pick<User, 'id' | 'name' | 'avatar'>;
  agent?: Pick<User, 'id' | 'name' | 'avatar' | 'agencyName'>;
  listing?: Pick<Listing, 'id' | 'title' | 'images' | 'price' | 'status'>;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
  read: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'user' | 'agent';
  agencyName?: string;
  licenseNumber?: string;
  bio?: string;
}

export interface ListingFilters {
  search?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: PropertyType;
  bedrooms?: number;
  status?: ListingStatus;
  includeTaken?: boolean;
}

export interface AdminStats {
  totalUsers: number;
  totalAgents: number;
  totalListings: number;
  listingsByStatus: Record<ListingStatus, number>;
  newSignupsThisWeek: number;
  newSignupsThisMonth: number;
  messagesSentToday: number;
  userGrowth: { date: string; count: number }[];
  listingsByCity: { city: string; count: number }[];
  listingsByPropertyType: { type: string; count: number }[];
  mostActiveAgents: {
    id: string;
    name: string;
    listingCount: number;
    responseRate: number;
  }[];
}
