import * as admin from 'firebase-admin';

// Protect from re-initializing in dev environments like Next.js
if (!admin.apps.length) {
    try {
        // Expected environment variables from Firebase Console -> Project Settings -> Service Accounts
        const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

        if (serviceAccountStr) {
            const serviceAccount = JSON.parse(serviceAccountStr);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log('Firebase admin initialized successfully with service account JSON');
        } else if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_PROJECT_ID) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    // Replace \n with actual newlines if specified as env var
                    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                }),
            });
            console.log('Firebase admin initialized successfully with discrete environment variables');
        } else {
            console.warn('Firebase admin initialization skipped: Missing service account environment variables');
        }
    } catch (error) {
        console.error('Firebase admin initialization error:', error);
    }
}

export const firebaseAdmin = admin;
