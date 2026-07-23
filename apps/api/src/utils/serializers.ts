import type { IUser } from '../models/User';
import type { User } from '@rentify/shared-types';

export function toPublicUser(user: IUser): User {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatar: user.avatar,
    createdAt: user.createdAt.toISOString(),
    isSuspended: user.isSuspended,
    agencyName: user.agencyName,
    bio: user.bio,
    licenseNumber: user.licenseNumber,
    rating: user.rating,
    isVerified: user.isVerified,
  };
}
