import { Router, Response } from 'express';
import mongoose from 'mongoose';
import { Listing } from '../models/Listing';
import { User } from '../models/User';
import { authenticate, requireRole, AuthenticatedRequest } from '../middleware/auth';
import type { ListingFilters } from '@rentify/shared-types';

const router = Router();

function serializeListing(listing: InstanceType<typeof Listing>) {
  const agent = listing.populated('agentId')
    ? (listing.agentId as unknown as InstanceType<typeof User>)
    : null;

  return {
    id: listing._id.toString(),
    agentId: listing.agentId.toString(),
    title: listing.title,
    description: listing.description,
    images: listing.images,
    price: listing.price,
    location: listing.location,
    propertyType: listing.propertyType,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    amenities: listing.amenities,
    status: listing.status,
    createdAt: listing.createdAt.toISOString(),
    updatedAt: listing.updatedAt.toISOString(),
    agent: agent
      ? {
          id: agent._id.toString(),
          name: agent.name,
          avatar: agent.avatar,
          rating: agent.rating,
          agencyName: agent.agencyName,
        }
      : undefined,
  };
}

router.get('/', async (req, res) => {
  try {
    const filters = req.query as unknown as ListingFilters;
    const query: Record<string, unknown> = {};

    if (!filters.includeTaken) {
      query.status = filters.status || 'available';
    } else if (filters.status) {
      query.status = filters.status;
    }

    if (filters.city) {
      query['location.city'] = new RegExp(filters.city, 'i');
    }
    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice)
        (query.price as Record<string, number>).$gte = Number(filters.minPrice);
      if (filters.maxPrice)
        (query.price as Record<string, number>).$lte = Number(filters.maxPrice);
    }
    if (filters.propertyType) query.propertyType = filters.propertyType;
    if (filters.bedrooms) query.bedrooms = { $gte: Number(filters.bedrooms) };

    if (filters.search) {
      query.$or = [
        { title: new RegExp(filters.search, 'i') },
        { description: new RegExp(filters.search, 'i') },
        { 'location.city': new RegExp(filters.search, 'i') },
        { 'location.address': new RegExp(filters.search, 'i') },
      ];
    }

    const listings = await Listing.find(query)
      .populate('agentId', 'name avatar rating agencyName')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ listings: listings.map(serializeListing) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

router.get(
  '/mine/all',
  authenticate,
  requireRole('agent'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const listings = await Listing.find({ agentId: req.auth!.userId }).sort({
        createdAt: -1,
      });
      res.json({ listings: listings.map(serializeListing) });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch listings' });
    }
  }
);

router.get('/agent/:agentId', async (req, res) => {
  try {
    const listings = await Listing.find({
      agentId: req.params.agentId,
      status: { $ne: 'pending' },
    })
      .populate('agentId', 'name avatar rating agencyName')
      .sort({ createdAt: -1 });

    res.json({ listings: listings.map(serializeListing) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch agent listings' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate(
      'agentId',
      'name avatar rating agencyName bio isVerified'
    );
    if (!listing) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }
    res.json({ listing: serializeListing(listing) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch listing' });
  }
});

router.post(
  '/',
  authenticate,
  requireRole('agent'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const listing = await Listing.create({
        ...req.body,
        agentId: req.auth!.userId,
        status: req.body.status || 'available',
      });
      const populated = await Listing.findById(listing._id).populate(
        'agentId',
        'name avatar rating agencyName'
      );
      res.status(201).json({ listing: serializeListing(populated!) });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to create listing' });
    }
  }
);

router.patch(
  '/:id',
  authenticate,
  requireRole('agent', 'admin'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const listing = await Listing.findById(req.params.id);
      if (!listing) {
        res.status(404).json({ error: 'Listing not found' });
        return;
      }

      if (
        req.auth!.role === 'agent' &&
        listing.agentId.toString() !== req.auth!.userId
      ) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }

      Object.assign(listing, req.body);
      await listing.save();

      const populated = await Listing.findById(listing._id).populate(
        'agentId',
        'name avatar rating agencyName'
      );
      res.json({ listing: serializeListing(populated!) });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update listing' });
    }
  }
);

router.delete(
  '/:id',
  authenticate,
  requireRole('agent', 'admin'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const listing = await Listing.findById(req.params.id);
      if (!listing) {
        res.status(404).json({ error: 'Listing not found' });
        return;
      }

      if (
        req.auth!.role === 'agent' &&
        listing.agentId.toString() !== req.auth!.userId
      ) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }

      await listing.deleteOne();
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to delete listing' });
    }
  }
);

export default router;
