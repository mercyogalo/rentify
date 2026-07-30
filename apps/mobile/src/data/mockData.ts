import type { Listing, User, Conversation, Message } from '@rentify/shared-types';

export const MOCK_AGENT: User = {
  id: 'agent-1',
  name: 'Sarah Mitchell',
  email: 'sarah@premierhomes.com',
  phone: '+1 555-0101',
  role: 'agent',
  avatar: 'https://i.pravatar.cc/150?u=sarah',
  createdAt: '2024-01-15T00:00:00Z',
  isSuspended: false,
  agencyName: 'Premier Homes Realty',
  bio: 'Licensed agent with 8+ years helping families find their perfect home in the greater metro area.',
  licenseNumber: 'RE-88421',
  rating: 4.8,
  isVerified: true,
};

export const MOCK_AGENT_2: User = {
  id: 'agent-2',
  name: 'James Chen',
  email: 'james@urbanliving.com',
  role: 'agent',
  avatar: 'https://i.pravatar.cc/150?u=james',
  createdAt: '2024-03-20T00:00:00Z',
  isSuspended: false,
  agencyName: 'Urban Living Co.',
  bio: 'Specializing in downtown apartments and modern condos.',
  rating: 4.6,
  isVerified: true,
};

export const MOCK_LISTINGS: Listing[] = [
  {
    id: 'listing-1',
    agentId: 'agent-1',
    title: 'Modern 3BR Family Home',
    description:
      'Spacious family home with open floor plan, updated kitchen, and large backyard. Quiet neighborhood near top-rated schools.',
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    ],
    price: 2850,
    location: '742 Oak Street, Austin',
    propertyType: 'house',
    bedrooms: 3,
    bathrooms: 2,
    amenities: ['Parking', 'Garden', 'AC', 'Pet Friendly'],
    status: 'available',
    createdAt: '2025-06-01T00:00:00Z',
    updatedAt: '2025-06-01T00:00:00Z',
    agent: {
      id: MOCK_AGENT.id,
      name: MOCK_AGENT.name,
      avatar: MOCK_AGENT.avatar,
      rating: MOCK_AGENT.rating,
      agencyName: MOCK_AGENT.agencyName,
    },
  },
  {
    id: 'listing-2',
    agentId: 'agent-2',
    title: 'Downtown Loft with City Views',
    description:
      'Stunning loft apartment on the 12th floor with floor-to-ceiling windows and premium finishes throughout.',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
    ],
    price: 3200,
    location: '100 Main Plaza, Unit 1204, Austin',
    propertyType: 'apartment',
    bedrooms: 2,
    bathrooms: 2,
    amenities: ['Gym', 'Pool', 'Doorman', 'Parking'],
    status: 'available',
    createdAt: '2025-06-10T00:00:00Z',
    updatedAt: '2025-06-10T00:00:00Z',
    agent: {
      id: MOCK_AGENT_2.id,
      name: MOCK_AGENT_2.name,
      avatar: MOCK_AGENT_2.avatar,
      rating: MOCK_AGENT_2.rating,
      agencyName: MOCK_AGENT_2.agencyName,
    },
  },
  {
    id: 'listing-3',
    agentId: 'agent-1',
    title: 'Cozy Studio Near Campus',
    description: 'Perfect for students or young professionals. Walk to cafes, transit, and university.',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    ],
    price: 1200,
    location: '55 College Ave, Austin',
    propertyType: 'studio',
    bedrooms: 0,
    bathrooms: 1,
    amenities: ['Laundry', 'WiFi', 'Furnished'],
    status: 'taken',
    createdAt: '2025-05-15T00:00:00Z',
    updatedAt: '2025-07-01T00:00:00Z',
    agent: {
      id: MOCK_AGENT.id,
      name: MOCK_AGENT.name,
      avatar: MOCK_AGENT.avatar,
      rating: MOCK_AGENT.rating,
      agencyName: MOCK_AGENT.agencyName,
    },
  },
  {
    id: 'listing-4',
    agentId: 'agent-2',
    title: 'Suburban Townhouse',
    description: 'Three-level townhouse with attached garage and community amenities.',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
    ],
    price: 2400,
    location: '890 Maple Drive, Round Rock',
    propertyType: 'townhouse',
    bedrooms: 3,
    bathrooms: 2.5,
    amenities: ['Garage', 'Pool', 'Playground'],
    status: 'available',
    createdAt: '2025-06-20T00:00:00Z',
    updatedAt: '2025-06-20T00:00:00Z',
    agent: {
      id: MOCK_AGENT_2.id,
      name: MOCK_AGENT_2.name,
      avatar: MOCK_AGENT_2.avatar,
      rating: MOCK_AGENT_2.rating,
      agencyName: MOCK_AGENT_2.agencyName,
    },
  },
];

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    userId: 'user-demo',
    agentId: 'agent-1',
    listingId: 'listing-1',
    lastMessage: 'Is the property still available for viewing this weekend?',
    lastMessageAt: '2025-07-20T14:30:00Z',
    agent: {
      id: MOCK_AGENT.id,
      name: MOCK_AGENT.name,
      avatar: MOCK_AGENT.avatar,
      agencyName: MOCK_AGENT.agencyName,
    },
    listing: {
      id: 'listing-1',
      title: 'Modern 3BR Family Home',
      images: MOCK_LISTINGS[0].images,
      price: 2850,
      status: 'available',
    },
  },
];

export const MOCK_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    conversationId: 'conv-1',
    senderId: 'user-demo',
    text: 'Hi! I saw your listing for the 3BR on Oak Street.',
    createdAt: '2025-07-20T14:00:00Z',
    read: true,
  },
  {
    id: 'msg-2',
    conversationId: 'conv-1',
    senderId: 'agent-1',
    text: 'Hello! Yes, it is still available. Would you like to schedule a viewing?',
    createdAt: '2025-07-20T14:15:00Z',
    read: true,
  },
  {
    id: 'msg-3',
    conversationId: 'conv-1',
    senderId: 'user-demo',
    text: 'Is the property still available for viewing this weekend?',
    createdAt: '2025-07-20T14:30:00Z',
    read: false,
  },
];

export const AMENITIES_OPTIONS = [
  'Parking',
  'Garden',
  'AC',
  'Pet Friendly',
  'Gym',
  'Pool',
  'Doorman',
  'Laundry',
  'WiFi',
  'Furnished',
  'Garage',
  'Balcony',
];

export const PROPERTY_TYPES = [
  { label: 'Apartment', value: 'apartment' },
  { label: 'House', value: 'house' },
  { label: 'Condo', value: 'condo' },
  { label: 'Townhouse', value: 'townhouse' },
  { label: 'Studio', value: 'studio' },
  { label: 'Other', value: 'other' },
] as const;
