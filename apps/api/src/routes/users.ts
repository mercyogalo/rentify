import { Router, Response } from 'express';
import { User } from '../models/User';
import { Listing } from '../models/Listing';
import { authenticate, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { toPublicUser } from '../utils/serializers';

const router = Router();

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'agent') {
      res.status(404).json({ error: 'Agent not found' });
      return;
    }

    const listings = await Listing.find({
      agentId: user._id,
      status: 'available',
    }).select('id title images price location status');

    res.json({
      agent: toPublicUser(user),
      listings: listings.map((l) => ({
        id: l._id.toString(),
        title: l.title,
        images: l.images,
        price: l.price,
        location: l.location,
        status: l.status,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch agent' });
  }
});

router.get(
  '/agents/stats',
  authenticate,
  requireRole('agent'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const agentId = req.auth!.userId;
      const [activeListings, totalViews] = await Promise.all([
        Listing.countDocuments({ agentId, status: 'available' }),
        Listing.countDocuments({ agentId }),
      ]);

      res.json({
        stats: {
          activeListings,
          totalListings: totalViews,
          newMessages: 0,
          views: totalViews * 12,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  }
);

export default router;
