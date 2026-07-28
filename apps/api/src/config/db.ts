import { initFirebase } from './firebase';

export async function connectDB(): Promise<void> {
  initFirebase();
  console.log('Firebase Admin initialized');
}
