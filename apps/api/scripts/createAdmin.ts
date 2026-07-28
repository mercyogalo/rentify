import dotenv from 'dotenv';
import { initFirebase, getAuth } from '../src/config/firebase';
import { db, now } from '../src/services/firestore';
import type { FirestoreUser } from '../src/types/firestore';

dotenv.config();

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
    process.exit(1);
  }

  initFirebase();
  const auth = getAuth();

  let userRecord;
  try {
    userRecord = await auth.getUserByEmail(email.toLowerCase());
    await auth.updateUser(userRecord.uid, { password });
    console.log('Updated existing Firebase user password');
  } catch {
    userRecord = await auth.createUser({
      email: email.toLowerCase(),
      password,
      displayName: 'Admin',
    });
    console.log('Created new Firebase admin user');
  }

  await auth.setCustomUserClaims(userRecord.uid, { role: 'admin' });

  const timestamp = now();
  const profile: FirestoreUser = {
    name: 'Admin',
    email: email.toLowerCase(),
    role: 'admin',
    isSuspended: false,
    rating: 0,
    isVerified: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await db().collection('users').doc(userRecord.uid).set(profile, { merge: true });
  console.log('Admin user ready:', email);
  console.log('UID:', userRecord.uid);
}

createAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
