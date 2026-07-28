import { Timestamp } from 'firebase-admin/firestore';
import { getFirestore } from '../config/firebase';
import type { FirestoreUser } from '../types/firestore';
import { toPublicUser } from '../utils/serializers';
import type { User } from '@rentify/shared-types';

export const db = () => getFirestore();

export async function getUserById(uid: string): Promise<User | null> {
  const doc = await db().collection('users').doc(uid).get();
  if (!doc.exists) return null;
  return toPublicUser(doc.id, doc.data() as FirestoreUser);
}

export async function getUsersByIds(uids: string[]): Promise<Map<string, User>> {
  const map = new Map<string, User>();
  if (!uids.length) return map;
  const unique = [...new Set(uids)];
  const snaps = await Promise.all(
    unique.map((id) => db().collection('users').doc(id).get())
  );
  for (const snap of snaps) {
    if (snap.exists) {
      map.set(snap.id, toPublicUser(snap.id, snap.data() as FirestoreUser));
    }
  }
  return map;
}

export function now(): Timestamp {
  return Timestamp.now();
}
