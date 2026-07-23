import mongoose, { Document, Schema } from 'mongoose';
import type { UserRole } from '@rentify/shared-types';

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  passwordHash?: string;
  googleId?: string;
  role: UserRole;
  avatar?: string;
  isSuspended: boolean;
  agencyName?: string;
  bio?: string;
  licenseNumber?: string;
  rating: number;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String },
    googleId: { type: String, sparse: true },
    role: {
      type: String,
      enum: ['user', 'agent', 'admin'],
      required: true,
      default: 'user',
    },
    avatar: { type: String },
    isSuspended: { type: Boolean, default: false },
    agencyName: { type: String },
    bio: { type: String },
    licenseNumber: { type: String },
    rating: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', userSchema);
