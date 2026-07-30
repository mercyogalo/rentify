import { Router, Response } from 'express';
import { db, getUserById, getUsersByIds, now } from '../services/firestore';
import { serializeListing, normalizeLocation } from '../utils/serializers';
import { authenticate, requireRole, AuthenticatedRequest } from '../middleware/auth';
import type { ListingFilters } from '@rentify/shared-types';
import type { FirestoreListing } from '../types/firestore';

const router = Router();

async function listingWithAgent(id: string, data: FirestoreListing) {
  const agent = await getUserById(data.agentId);
  return serializeListing(id, data, agent
    ? { id: agent.id, name: agent.name, avatar: agent.avatar, rating: agent.rating, agencyName: agent.agencyName }
    : undefined);
}

router.get('/', async (req, res) => {
  try {
    const filters = req.query as unknown as ListingFilters;
    let query = db().collection('listings').orderBy('createdAt', 'desc').limit(200);
    const snap = await query.get();
    let listings = snap.docs.map((d) => ({ id: d.id, ...(d.data() as FirestoreListing) }));

    if (!filters.includeTaken) {
      listings = listings.filter((l) => (filters.status ? l.status === filters.status : l.status === 'available'));
    } else if (filters.status) {
      listings = listings.filter((l) => l.status === filters.status);
    }
    if (filters.city) {
      const city = filters.city.toLowerCase();
      listings = listings.filter((l) => normalizeLocation(l.location).toLowerCase().includes(city));
    }
    if (filters.minPrice) listings = listings.filter((l) => l.price >= Number(filters.minPrice));
    if (filters.maxPrice) listings = listings.filter((l) => l.price <= Number(filters.maxPrice));
    if (filters.propertyType) listings = listings.filter((l) => l.propertyType === filters.propertyType);
    if (filters.bedrooms) listings = listings.filter((l) => l.bedrooms >= Number(filters.bedrooms));
    if (filters.search) {
      const q = filters.search.toLowerCase();
      listings = listings.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          normalizeLocation(l.location).toLowerCase().includes(q)
      );
    }

    const agentIds = [...new Set(listings.map((l) => l.agentId))];
    const agents = await getUsersByIds(agentIds);

    res.json({
      listings: listings.slice(0, 100).map((l) =>
        serializeListing(l.id, l, agents.get(l.agentId)
          ? { id: agents.get(l.agentId)!.id, name: agents.get(l.agentId)!.name, avatar: agents.get(l.agentId)!.avatar, rating: agents.get(l.agentId)!.rating, agencyName: agents.get(l.agentId)!.agencyName }
          : undefined)
      ),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

router.get('/mine/all', authenticate, requireRole('agent'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const snap = await db()
      .collection('listings')
      .where('agentId', '==', req.auth!.userId)
      .orderBy('createdAt', 'desc')
      .get();
    res.json({
      listings: await Promise.all(snap.docs.map((d) => listingWithAgent(d.id, d.data() as FirestoreListing))),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

router.get('/agent/:agentId', async (req, res) => {
  try {
    const snap = await db()
      .collection('listings')
      .where('agentId', '==', req.params.agentId)
      .orderBy('createdAt', 'desc')
      .get();
    const listings = snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as FirestoreListing) }))
      .filter((l) => l.status !== 'pending');
    const agent = await getUserById(req.params.agentId);
    res.json({
      listings: listings.map((l) =>
        serializeListing(l.id, l, agent
          ? { id: agent.id, name: agent.name, avatar: agent.avatar, rating: agent.rating, agencyName: agent.agencyName }
          : undefined)
      ),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch agent listings' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const doc = await db().collection('listings').doc(req.params.id).get();
    if (!doc.exists) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }
    res.json({ listing: await listingWithAgent(doc.id, doc.data() as FirestoreListing) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch listing' });
  }
});

router.post('/', authenticate, requireRole('agent'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, images, price, location, propertyType, bedrooms, bathrooms, amenities, status } =
      req.body;

    if (typeof location !== 'string' || !location.trim()) {
      res.status(400).json({ error: 'Location is required' });
      return;
    }

    const timestamp = now();
    const data: FirestoreListing = {
      title,
      description,
      images: images || [],
      price,
      location: location.trim(),
      propertyType,
      bedrooms,
      bathrooms,
      amenities: amenities || [],
      agentId: req.auth!.userId,
      status: status || 'available',
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const ref = await db().collection('listings').add(data);
    res.status(201).json({ listing: await listingWithAgent(ref.id, data) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

router.patch('/:id', authenticate, requireRole('agent', 'admin'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ref = db().collection('listings').doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }
    const existing = doc.data() as FirestoreListing;
    if (req.auth!.role === 'agent' && existing.agentId !== req.auth!.userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    const updates: Record<string, unknown> = { updatedAt: now() };
    const allowed = [
      'title',
      'description',
      'images',
      'price',
      'location',
      'propertyType',
      'bedrooms',
      'bathrooms',
      'amenities',
      'status',
    ];
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    if (typeof updates.location === 'string') {
      updates.location = updates.location.trim();
    }
    await ref.update(updates);
    const updated = await ref.get();
    res.json({ listing: await listingWithAgent(updated.id, updated.data() as FirestoreListing) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update listing' });
  }
});

router.delete('/:id', authenticate, requireRole('agent', 'admin'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ref = db().collection('listings').doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }
    const existing = doc.data() as FirestoreListing;
    if (req.auth!.role === 'agent' && existing.agentId !== req.auth!.userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    await ref.delete();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete listing' });
  }
});

export default router;
