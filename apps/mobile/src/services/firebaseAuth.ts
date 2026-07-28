import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithCredential,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured } from './firebase';
import type { User, RegisterRequest } from '@rentify/shared-types';
import { apiRequest } from './api';

export async function getIdToken(): Promise<string | null> {
  if (!isFirebaseConfigured) return null;
  const auth = getFirebaseAuth();
  if (!auth.currentUser) return null;
  return auth.currentUser.getIdToken();
}

export async function setupProfile(
  token: string,
  data: Partial<RegisterRequest> & { name: string; email: string; avatar?: string }
): Promise<User> {
  const res = await apiRequest<{ user: User }>('/api/auth/profile', {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  });
  return res.user;
}

export async function fetchProfile(token: string): Promise<User> {
  const res = await apiRequest<{ user: User }>('/api/auth/me', { token });
  return res.user;
}

export async function registerWithEmail(data: RegisterRequest): Promise<{ user: User; token: string }> {
  const auth = getFirebaseAuth();
  const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
  const token = await cred.user.getIdToken();
  const user = await setupProfile(token, data);
  return { user, token };
}

export async function loginWithEmail(email: string, password: string): Promise<{ user: User; token: string }> {
  const auth = getFirebaseAuth();
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const token = await cred.user.getIdToken();
  const user = await fetchProfile(token);
  return { user, token };
}

export async function loginWithGoogleIdToken(idToken: string): Promise<{ user: User; token: string; isNew: boolean }> {
  const auth = getFirebaseAuth();
  const credential = GoogleAuthProvider.credential(idToken);
  const cred = await signInWithCredential(auth, credential);
  const token = await cred.user.getIdToken();
  try {
    const user = await fetchProfile(token);
    return { user, token, isNew: false };
  } catch {
    const user = await setupProfile(token, {
      name: cred.user.displayName || 'User',
      email: cred.user.email || '',
      role: 'user',
      phone: '',
      password: '',
      avatar: cred.user.photoURL || undefined,
    });
    return { user, token, isNew: true };
  }
}

export async function logoutFirebase(): Promise<void> {
  await signOut(getFirebaseAuth());
}

export function subscribeAuth(callback: (user: FirebaseUser | null) => void) {
  if (!isFirebaseConfigured) return () => {};
  return onAuthStateChanged(getFirebaseAuth(), callback);
}

export { isFirebaseConfigured };
