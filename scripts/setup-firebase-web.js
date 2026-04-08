#!/usr/bin/env node

/**
 * Firebase Web Push Setup Script
 *
 * This script helps generate the service worker with correct Firebase config.
 * Run: node scripts/setup-firebase-web.js
 */

const fs = require('fs');
const path = require('path');

console.log(`
========================================
Firebase Web Push Setup
========================================

To enable notifications on Mac/Windows/iPhone/Android, you need:

1. Get your Firebase Web Config:
   - Go to: https://console.firebase.google.com/project/fll-console/settings/general
   - Scroll down to "Your apps" section
   - Click on the Web app (</> icon)
   - Copy the config values

2. Get your VAPID Key:
   - Go to: https://console.firebase.google.com/project/fll-console/settings/cloudmessaging
   - Scroll to "Web Push Certificates"
   - Click "Generate Key Pair" (if not already generated)
   - Copy the "Key pair" value

3. Add these to your .env.local file:
`);

// Read current service account to extract project info
try {
  const serviceAccountPath = path.join(process.cwd(), 'service-account.json');
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

  console.log(`NEXT_PUBLIC_FIREBASE_PROJECT_ID="${serviceAccount.project_id}"`);
  console.log(`NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="${serviceAccount.project_id}.firebaseapp.com"`);
  console.log(`NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="${serviceAccount.project_id}.firebasestorage.app"`);
  console.log(`
# TODO: Get these from Firebase Console > Project Settings > General > Web App
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"

# TODO: Get this from Firebase Console > Cloud Messaging > Web Push Certificates
NEXT_PUBLIC_FIREBASE_VAPID_KEY="your-vapid-key"
`);

} catch (e) {
  console.log(`# TODO: Fill these from Firebase Console > Project Settings > General > Web App
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="fll-console.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="fll-console"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="fll-console.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"

# TODO: Get this from Firebase Console > Cloud Messaging > Web Push Certificates
NEXT_PUBLIC_FIREBASE_VAPID_KEY="your-vapid-key"
`);
}

console.log(`
4. After setting .env.local, restart your dev server.

5. Open the admin dashboard in browser and allow notifications when prompted.

========================================
`);
