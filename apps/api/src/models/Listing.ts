import mongoose, { Document, Schema } from 'mongoose';
import type { ListingStatus, PropertyType } from '@rentify/shared-types';

export interface IListing extends Document {
  agentId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  images: string[];
  price: number;
  location: {
    address: string;
    city: string;
    lat: number;
    lng: number;
  };
  propertyType: PropertyType;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  status: ListingStatus;
  createdAt: Date;
  updatedAt: Date;
}

const listingSchema = new Schema<IListing>(
  {
    agentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    images: [{ type: String }],
    price: { type: Number, required: true, min: 0 },
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    propertyType: {
      type: String,
      enum: ['apartment', 'house', 'condo', 'townhouse', 'studio', 'other'],
      required: true,
    },
    bedrooms: { type: Number, required: true, min: 0 },
    bathrooms: { type: Number, required: true, min: 0 },
    amenities: [{ type: String }],
    status: {
      type: String,
      enum: ['available', 'taken', 'pending'],
      default: 'available',
    },
  },
  { timestamps: true }
);

listingSchema.index({ 'location.city': 1, status: 1, price: 1 });

export const Listing = mongoose.model<IListing>('Listing', listingSchema);
