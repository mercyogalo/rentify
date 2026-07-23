import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/User';
import { signToken } from '../utils/jwt';
import { toPublicUser } from '../utils/serializers';
import { env } from '../config/env';
import type { AuthenticatedRequest } from '../middleware/auth';
import { authenticate } from '../middleware/auth';

const router = Router();

if (env.googleClientId && env.googleClientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.googleClientId,
        clientSecret: env.googleClientSecret,
        callbackURL: env.googleCallbackUrl,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id });
          if (!user) {
            user = await User.findOne({ email: profile.emails?.[0]?.value });
            if (user) {
              user.googleId = profile.id;
              await user.save();
            } else {
              user = await User.create({
                name: profile.displayName || 'Google User',
                email: profile.emails?.[0]?.value,
                googleId: profile.id,
                avatar: profile.photos?.[0]?.value,
                role: 'user',
              });
            }
          }
          done(null, user);
        } catch (err) {
          done(err as Error);
        }
      }
    )
  );
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, role, agencyName, licenseNumber, bio } =
      req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required' });
      return;
    }

    if (role === 'admin') {
      res.status(400).json({ error: 'Admin registration is not allowed' });
      return;
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      passwordHash,
      role: role || 'user',
      agencyName: role === 'agent' ? agencyName : undefined,
      licenseNumber: role === 'agent' ? licenseNumber : undefined,
      bio: role === 'agent' ? bio : undefined,
    });

    const token = signToken({ userId: user._id.toString(), role: user.role });
    res.status(201).json({ token, user: toPublicUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });

    if (!user || !user.passwordHash) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    if (user.isSuspended) {
      res.status(403).json({ error: 'Account suspended' });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = signToken({ userId: user._id.toString(), role: user.role });
    res.json({ token, user: toPublicUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.auth!.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({ user: toPublicUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.patch('/me', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const allowed = [
      'name',
      'phone',
      'avatar',
      'bio',
      'agencyName',
      'licenseNumber',
    ];
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const user = await User.findByIdAndUpdate(req.auth!.userId, updates, {
      new: true,
    });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({ user: toPublicUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Update failed' });
  }
});

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    const user = req.user as typeof User.prototype;
    const token = signToken({
      userId: user._id.toString(),
      role: user.role,
    });
    res.redirect(`${env.mobileScheme}://auth?token=${token}`);
  }
);

export default router;
