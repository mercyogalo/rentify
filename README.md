# Rentify

A marketplace connecting home seekers with real estate agents. Monorepo with:

- **`apps/mobile`** — Expo React Native app (User + Agent flows)
- **`apps/admin-dashboard`** — React + Vite admin panel
- **`apps/api`** — Node/Express + MongoDB API with Socket.io
- **`packages/shared-types`** — Shared TypeScript interfaces

## Tech Stack

| Layer | Stack |
|-------|-------|
| Mobile | Expo, React Navigation, Zustand, TypeScript |
| Admin | React, Vite, Recharts, Zustand |
| API | Express, Mongoose, JWT, Passport Google OAuth, Socket.io, Cloudinary |
| Design | Minimal monochrome UI, deep green accent (`#1B4332`) |

## Quick Start

```bash
# Install dependencies
npm install

# Build shared types
npm run build:types

# Start API (requires MongoDB)
cp apps/api/.env.example apps/api/.env
npm run api

# Start mobile app (mock mode by default)
npm run mobile

# Start admin dashboard
npm run admin
```

## Mock Mode (Mobile)

The mobile app runs in **mock mode** by default (`EXPO_PUBLIC_USE_MOCK` unset or not `false`). This lets you explore all screens without a running backend.

**Demo login:** use any email — include `agent` in the address to log in as an agent (e.g. `agent@test.com`).

To connect to the real API:

```bash
# apps/mobile/.env
EXPO_PUBLIC_API_URL=http://localhost:4000
EXPO_PUBLIC_USE_MOCK=false
```

## Admin Setup

Admin accounts are **not** self-registered. Create one via the seed script:

```bash
# Set ADMIN_EMAIL and ADMIN_PASSWORD in apps/api/.env
npm run seed:admin
```

Then log in at `http://localhost:5173/login` using the same `/api/auth/login` endpoint.

## Project Structure

```
rentify/
├── apps/
│   ├── mobile/           # Expo RN app
│   ├── admin-dashboard/  # Web admin panel
│   └── api/              # Express backend
├── packages/
│   └── shared-types/     # User, Listing, Conversation, Message types
└── package.json          # npm workspaces root
```

## Key Features Implemented

- Role-based navigation (User tabs vs Agent tabs after login)
- Onboarding → Auth → Home flow
- Listing feed with search + AND-combined filters
- House detail with map, amenities, agent card, contact → chat
- Real-time chat UI with listing context banner + "taken" sync
- Agent dashboard, multi-step listing form, manage listings
- Admin analytics (line/bar/pie charts), user/agent/listing tables
- JWT auth, role middleware, Google OAuth hooks, Socket.io rooms
- Cloudinary upload route (falls back to placeholder when unconfigured)

## Environment Variables

See `apps/api/.env.example` for API config. Admin dashboard uses `VITE_API_URL` (default `http://localhost:4000`).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run mobile` | Start Expo dev server |
| `npm run api` | Start Express API with hot reload |
| `npm run admin` | Start Vite admin dashboard |
| `npm run seed:admin` | Create admin user from env vars |
| `npm run build:types` | Compile shared-types package |
