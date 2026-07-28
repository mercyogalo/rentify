import admin from 'firebase-admin';
import { env } from './env';

let initialized = false;

export function initFirebase(): admin.app.App {
  if (initialized && admin.apps.length) {
    return admin.app();
  }

  if (env.firebase.projectId && env.firebase.clientEmail && env.firebase.privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.firebase.projectId,
        clientEmail: env.firebase.clientEmail,
        privateKey: env.firebase.privateKey,
      }),
    });
  } else {
    admin.initializeApp({
      projectId: env.firebase.projectId || 'demo-rentify',
    });
  }

  initialized = true;
  return admin.app();
}

export function getAuth(): admin.auth.Auth {
  initFirebase();
  return admin.auth();
}

export function getFirestore(): admin.firestore.Firestore {
  initFirebase();
  return admin.firestore();
}
