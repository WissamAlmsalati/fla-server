import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

/**
 * FCM Diagnostic Script
 *
 * This script helps diagnose Firebase Cloud Messaging configuration issues.
 * Run with: npx ts-node scripts/diagnose-fcm.ts
 */

async function diagnoseFCM() {
    console.log('========================================');
    console.log('FCM Configuration Diagnostic');
    console.log('========================================\n');

    // 1. Check service account file
    console.log('1. Checking service-account.json...');
    const serviceAccountPath = path.join(process.cwd(), 'service-account.json');
    if (!fs.existsSync(serviceAccountPath)) {
        console.error('   ❌ service-account.json not found!');
        return;
    }
    console.log('   ✅ service-account.json exists');

    let serviceAccount: any;
    try {
        serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        console.log(`   ✅ Project ID: ${serviceAccount.project_id}`);
        console.log(`   ✅ Client Email: ${serviceAccount.client_email}`);
        console.log(`   ✅ Private Key ID: ${serviceAccount.private_key_id}`);
    } catch (e: any) {
        console.error('   ❌ Failed to parse service-account.json:', e.message);
        return;
    }

    // 2. Validate private key format
    console.log('\n2. Validating private key format...');
    const privateKey = serviceAccount.private_key;
    if (!privateKey) {
        console.error('   ❌ Private key is missing!');
        return;
    }
    if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
        console.error('   ❌ Private key missing BEGIN header');
    } else if (!privateKey.includes('-----END PRIVATE KEY-----')) {
        console.error('   ❌ Private key missing END footer');
    } else {
        console.log('   ✅ Private key format looks correct');
    }

    // 3. Check for environment variables
    console.log('\n3. Checking environment variables...');
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        console.log('   ℹ️  FIREBASE_SERVICE_ACCOUNT_JSON is set (will override service-account.json)');
    }
    if (process.env.FIREBASE_PROJECT_ID) {
        console.log(`   ℹ️  FIREBASE_PROJECT_ID=${process.env.FIREBASE_PROJECT_ID}`);
    }
    if (process.env.FIREBASE_CLIENT_EMAIL) {
        console.log(`   ℹ️  FIREBASE_CLIENT_EMAIL=${process.env.FIREBASE_CLIENT_EMAIL}`);
    }
    if (process.env.FIREBASE_PRIVATE_KEY) {
        console.log('   ℹ️  FIREBASE_PRIVATE_KEY is set');
    }

    // 4. Initialize Firebase Admin
    console.log('\n4. Initializing Firebase Admin...');
    try {
        if (admin.apps.length) {
            console.log('   ℹ️  Firebase already initialized');
        } else {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log('   ✅ Firebase Admin initialized successfully');
        }
    } catch (e: any) {
        console.error('   ❌ Failed to initialize Firebase:', e.message);
        return;
    }

    // 5. Test FCM with a dry-run message
    console.log('\n5. Testing FCM connection...');
    console.log('   Note: This sends a test message to an invalid token to verify auth works');

    try {
        // Using an intentionally invalid token to test auth without sending real message
        await admin.messaging().send({
            token: 'test-token-this-is-invalid',
            notification: { title: 'Test', body: 'Test' }
        });
    } catch (e: any) {
        // We expect an error about invalid token, but NOT auth errors
        if (e.code === 'messaging/invalid-registration-token' ||
            e.code === 'messaging/registration-token-not-registered') {
            console.log('   ✅ FCM authentication is working (got expected token error)');
        } else if (e.code === 'messaging/mismatched-credential') {
            console.error('   ❌ SenderId mismatch - the token was registered with a different Firebase project');
            console.error('      Solution: Clear all FCM tokens and have users re-register');
        } else if (e.code === 'messaging/third-party-auth-error') {
            console.error('   ❌ Authentication error - service account may be disabled or missing permissions');
            console.error('      Solution: Check Firebase Console > Project Settings > Service Accounts');
        } else {
            console.log(`   ⚠️  Got error: ${e.code} - ${e.message}`);
        }
    }

    // 6. Summary
    console.log('\n========================================');
    console.log('Diagnostic Summary');
    console.log('========================================');
    console.log(`Project ID: ${serviceAccount.project_id}`);
    console.log(`Client Email: ${serviceAccount.client_email}`);
    console.log('\nCommon Issues:');
    console.log('1. SenderId mismatch: Tokens were registered with a different Firebase project');
    console.log('   -> Clear tokens in DB, have users re-register');
    console.log('2. Third-party auth error: Service account disabled or missing FCM permissions');
    console.log('   -> Check Firebase Console > IAM & Admin > Service Accounts');
    console.log('========================================');
}

diagnoseFCM().catch(console.error);
