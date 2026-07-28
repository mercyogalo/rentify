import { Router, Response } from 'express';
import { getAuth } from '../config/firebase';
import { getUserById, db, now } from '../services/firestore';
import { toPublicUser } from '../utils/serializers';
import type { AuthenticatedRequest } from '../middleware/auth';
import { authenticate } from '../middleware/auth';
import type { FirestoreUser } from '../types/firestore';
import type { UserRole } from '@rentify/shared-types';

const router = Router();

router.post('/profile', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const uid = req.auth!.userId;
    const { name, email, phone, role, agencyName, licenseNumber, bio, avatar } = req.body;

    if (role === 'admin') {
      res.status(400).json({ error: 'Admin registration is not allowed' });
      return;
    }

    const userRole: UserRole = role === 'agent' ? 'agent' : 'user';
    const ref = db().collection('users').doc(uid);
    const existing = await ref.get();
    const timestamp = now();

    const profile: FirestoreUser = {
      name: name || email?.split('@')[0] || 'User',
      email: (email || req.auth!.email || '').toLowerCase(),
      phone,
      role: existing.exists ? (existing.data() as FirestoreUser).role : userRole,
      avatar,
      isSuspended: false,
      agencyName: userRole === 'agent' ? agencyName : undefined,
      licenseNumber: userRole === 'agent' ? licenseNumber : undefined,
      bio: userRole === 'agent' ? bio : undefined,
      rating: existing.exists ? (existing.data() as FirestoreUser).rating : 0,
      isVerified: existing.exists ? (existing.data() as FirestoreUser).isVerified : false,
      createdAt: existing.exists ? (existing.data() as FirestoreUser).createdAt : timestamp,
      updatedAt: timestamp,
    };

    if (!existing.exists && userRole === 'agent') {
      profile.role = 'agent';
      profile.agencyName = agencyName;
      profile.licenseNumber = licenseNumber;
      profile.bio = bio;
    }

    await ref.set(profile, { merge: true });
    await getAuth().setCustomUserClaims(uid, { role: profile.role });

    const token = await getAuth().createCustomToken(uid);
    res.status(existing.exists ? 200 : 201).json({
      user: toPublicUser(uid, profile),
      customToken: token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Profile setup failed' });
  }
});

router.get('/me', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await getUserById(req.auth!.userId);
    if (!user) {
      res.status(404).json({ error: 'Profile not found. Complete registration.' });
      return;
    }
    if (user.isSuspended) {
      res.status(403).json({ error: 'Account suspended' });
      return;
    }
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.patch('/me', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const uid = req.auth!.userId;
    const ref = db().collection('users').doc(uid);
    const doc = await ref.get();
    if (!doc.exists) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const allowed = ['name', 'phone', 'avatar', 'bio', 'agencyName', 'licenseNumber'];
    const updates: Record<string, unknown> = { updatedAt: now() };
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    await ref.update(updates);
    const updated = await ref.get();
    res.json({ user: toPublicUser(uid, updated.data() as FirestoreUser) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Update failed' });
  }
});

export default router;
