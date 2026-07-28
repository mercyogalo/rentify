import { Request, Response, NextFunction } from 'express';
import { getAuth, getFirestore } from '../config/firebase';
import type { UserRole } from '@rentify/shared-types';

export interface AuthPayload {
  userId: string;
  role: UserRole;
  email?: string;
}

export interface AuthenticatedRequest extends Request {
  auth?: AuthPayload;
}

async function resolveRole(uid: string, tokenRole?: string): Promise<UserRole> {
  if (tokenRole === 'admin' || tokenRole === 'agent' || tokenRole === 'user') {
    return tokenRole;
  }
  const doc = await getFirestore().collection('users').doc(uid).get();
  if (doc.exists) {
    return (doc.data()?.role as UserRole) || 'user';
  }
  return 'user';
}

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const token = header.slice(7);
  getAuth()
    .verifyIdToken(token)
    .then(async (decoded) => {
      const role = await resolveRole(decoded.uid, decoded.role as string | undefined);
      (req as AuthenticatedRequest).auth = {
        userId: decoded.uid,
        role,
        email: decoded.email,
      };
      next();
    })
    .catch(() => {
      res.status(401).json({ error: 'Invalid or expired token' });
    });
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const auth = (req as AuthenticatedRequest).auth;
    if (!auth || !roles.includes(auth.role)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    next();
  };
}
