import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { initializeAuth, getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;
let storage: FirebaseStorage | null = null;

function getApp(): FirebaseApp {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase is not configured. Set EXPO_PUBLIC_FIREBASE_* env vars.');
  }
  if (!app) {
    app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    const firebaseApp = getApp();
    if (Platform.OS === 'web') {
      auth = getAuth(firebaseApp);
    } else {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { getReactNativePersistence } = require('firebase/auth/react-native') as {
          getReactNativePersistence: (storage: typeof AsyncStorage) => unknown;
        };
        auth = initializeAuth(firebaseApp, {
          persistence: getReactNativePersistence(AsyncStorage) as never,
        });
      } catch {
        auth = getAuth(firebaseApp);
      }
    }
  }
  return auth;
}

export function getFirebaseFirestore(): Firestore {
  if (!firestore) firestore = getFirestore(getApp());
  return firestore;
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!storage) storage = getStorage(getApp());
  return storage;
}

export { getFirebaseAuth as auth };
