# Rentify

A marketplace connecting home seekers with real estate agents. Monorepo with:

- **`apps/mobile`** — Expo React Native app (User + Agent/Landlord flows)
- **`apps/admin-dashboard`** — React + Vite admin panel
- **`apps/api`** — Node/Express API: **Firebase** Auth + Firestore, **AWS S3** for images
- **`packages/shared-types`** — Shared TypeScript interfaces

## Tech Stack

| Layer | Stack |
|-------|-------|
| Mobile | Expo, React Navigation, Zustand, Firebase Auth + Google Sign-In |
| Admin | React, Vite, Recharts, Firebase Auth + Google Sign-In |
| Backend | Express, **Firebase Admin** (Auth, Firestore), **AWS S3**, Socket.io |
| Auth | Firebase Authentication (email/password + Google OAuth) |

## Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** → Email/Password and **Google** sign-in
3. Create a **Firestore** database (Storage is **not** required — images go to AWS S3)
4. Create an **AWS S3 bucket** and IAM access keys for image uploads
5. Download a **service account key** (Project Settings → Service Accounts) for the API
6. Copy env files and fill in credentials:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/mobile/.env.example apps/mobile/.env
cp apps/admin-dashboard/.env.example apps/admin-dashboard/.env
```

6. Deploy security rules:

```bash
npx -y firebase-tools@latest login
npx -y firebase-tools@latest use your-project-id
npm run firebase:deploy
```

7. Create admin account:

```bash
npm run seed:admin
```

## Quick Start

```bash
npm install
npm run build:types
npm run api      # Express API (Firebase backend)
npm run mobile   # Expo app
npm run admin    # Admin dashboard
npm run test     # Type-check all packages
```

## Auth Flow

- **Mobile/Admin** authenticate via Firebase Auth (email/password or Google)
- Clients send Firebase **ID tokens** as `Authorization: Bearer <token>` to the API
- User profiles (role, phone, agency info) are stored in Firestore `users/{uid}`
- Admin role is set via custom claims + seed script (not self-registerable)
- Signup role options: **Looking for a home** or **Agent / Landlord**

## Image Uploads

Listing and profile photos are uploaded to **AWS S3** via `POST /api/upload` (authenticated). Configure in `apps/api/.env`:

```
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=eu-north-1
AWS_BUCKET_NAME=rentify-store
```

The mobile app uses `expo-image-picker` and sends images to the API; returned S3 URLs are stored in Firestore listing documents.

## Mock Mode

If Firebase env vars are missing, the mobile app falls back to mock data. Set `EXPO_PUBLIC_USE_MOCK=true` to force mock mode.

## Project Structure

```
rentify/
├── firebase.json          # Firebase rules & auth config
├── firestore.rules
├── storage.rules
├── apps/
│   ├── mobile/
│   ├── admin-dashboard/
│   └── api/
└── packages/shared-types/
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run mobile` | Start Expo dev server |
| `npm run api` | Start Express API |
| `npm run admin` | Start admin dashboard |
| `npm run seed:admin` | Create Firebase admin user |
| `npm run test` | Type-check all packages |
| `npm run firebase:deploy` | Deploy Firestore rules + Auth config |
