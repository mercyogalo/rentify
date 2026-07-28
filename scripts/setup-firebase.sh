#!/usr/bin/env bash
# Finish Firebase setup for Rentify (project: rentify-d14d3)
set -euo pipefail

PROJECT_ID="rentify-d14d3"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> Using Firebase project: $PROJECT_ID"
cd "$ROOT"
npx -y firebase-tools@latest use "$PROJECT_ID"

echo ""
echo "==> Checking Firebase apps..."
npx -y firebase-tools@latest apps:list --project "$PROJECT_ID"

echo ""
echo "==> Deploying Auth configuration (email/password + Google)..."
npx -y firebase-tools@latest deploy --only auth --project "$PROJECT_ID"

echo ""
echo "==> Deploying Firestore rules + indexes..."
if npx -y firebase-tools@latest firestore:databases:list --project "$PROJECT_ID" 2>/dev/null | grep -q "(default)"; then
  npx -y firebase-tools@latest deploy --only firestore --project "$PROJECT_ID"
else
  echo "⚠ Firestore database not created yet."
  echo "  Open: https://console.firebase.google.com/project/$PROJECT_ID/firestore"
  echo "  Click 'Create database' → Standard edition → Production mode → choose location → Create"
  echo "  Then re-run: npm run firebase:deploy"
fi

echo ""
echo "==> AWS S3 (image uploads — not Firebase Storage)"
echo "  Configure apps/api/.env with AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_BUCKET_NAME"
echo ""
echo "==> Next: API service account"
echo "  1. Open: https://console.firebase.google.com/project/$PROJECT_ID/settings/serviceaccounts/adminsdk"
echo "  2. Generate new private key → save JSON"
echo "  3. Copy client_email and private_key into apps/api/.env"
echo ""
echo "==> Then create admin:"
echo "  npm run seed:admin"
echo ""
echo "==> Google Sign-In client ID (for mobile):"
echo "  Firebase Console > Authentication > Sign-in method > Google > Web SDK configuration"
echo "  Copy Web client ID into apps/mobile/.env → EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID"
