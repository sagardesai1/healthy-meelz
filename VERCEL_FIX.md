# Vercel Build Fix

## Problem

Vercel was trying to compile the Firebase Functions code (`functions/` directory), which caused build errors because:

- Firebase Functions dependencies (`firebase-functions`, `firebase-admin`) are not needed for the Next.js frontend
- The `functions/` directory contains backend-only code that should not be included in the Vercel build

## Solution

### 1. Updated `tsconfig.json`

Excluded the `functions` directory from TypeScript compilation:

```json
"exclude": ["node_modules", "functions"]
```

### 2. Updated `next.config.ts`

- Set the correct workspace root to avoid lockfile warnings
- Added webpack aliases to exclude Firebase Functions packages from client-side bundles

### 3. Created `.vercelignore`

Explicitly tells Vercel to ignore:

- `functions/` directory
- `tests/` directory
- Debug logs
- Firebase config files

## Result

✅ Next.js builds successfully
✅ No Firebase Functions errors
✅ Frontend and backend code are properly separated
✅ Vercel deployment should now work

## Architecture

- **Frontend (Vercel)**: Next.js app in `src/` directory
- **Backend (Firebase)**: Cloud Functions in `functions/` directory
- **Communication**: Frontend calls Firebase Functions via HTTPS endpoints

## Deployment

- **Frontend**: Deploy to Vercel (automatically on git push)
- **Backend**: Deploy to Firebase with `firebase deploy --only functions`
