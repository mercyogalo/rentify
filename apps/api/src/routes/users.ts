import { Router, Response } from 'express';
import { db } from '../services/firestore';
import { toPublicUser } from '../utils/serializers';
import { authenticate, requireRole, AuthenticatedRequest } from '../middleware/auth';
import type { FirestoreListing, FirestoreUser } from '../types/firestore';

const router = Router();

router.get('/agents/stats', authenticate, requireRole('agent'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const agentId = req.auth!.userId;
    const snap = await db().collection('listings').where('agentId', '==', agentId).get();
    const listings = snap.docs.map((d) => d.data() as FirestoreListing);
    res.json({
      stats: {
        activeListings: listings.filter((l) => l.status === 'available').length,
        totalListings: listings.length,
        newMessages: 0,
        views: listings.length * 12,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await db().collection('users').doc(req.params.id).get();
    if (!user.exists || user.data()?.role !== 'agent') {
      res.status(404).json({ error: 'Agent not found' });
      return;
    }
    const agent = toPublicUser(user.id, user.data() as FirestoreUser);
    const snap = await db()
      .collection('listings')
      .where('agentId', '==', req.params.id)
      .where('status', '==', 'available')
      .get();
    res.json({
      agent,
      listings: snap.docs.map((d) => {
        const l = d.data() as FirestoreListing;
        return { id: d.id, title: l.title, images: l.images, price: l.price, location: l.location, status: l.status };
      }),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch agent' });
  }
});

export default router;
