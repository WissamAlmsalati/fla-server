import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

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
        } else {
            const serviceAccountPath = path.join(process.cwd(), 'service-account.json');
            if (fs.existsSync(serviceAccountPath)) {
                // Optionally parse a local service-account.json file bypassing the ENV entirely
                try {
                    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
                    admin.initializeApp({
                        credential: admin.credential.cert(serviceAccount)
                    });
                    console.log('Firebase admin initialized successfully with local service-account.json file');
                } catch (fileError) {
                    console.warn('Failed to parse local service-account.json file, falling back to other methods:', fileError);
                }
            } else if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_PROJECT_ID) {
                // Clean the key: remove surrounding quotes and replace literal \n with real newlines
                let privateKey = process.env.FIREBASE_PRIVATE_KEY;

                // Next.js sometimes double-escapes things or parses the \n string into literal characters instead of breaks
                privateKey = privateKey.replace(/\\n/g, '\n');

                // Just in case it's actually wrapped in quotes
                if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
                    privateKey = privateKey.substring(1, privateKey.length - 1);
                }

                admin.initializeApp({
                    credential: admin.credential.cert({
                        projectId: process.env.FIREBASE_PROJECT_ID,
                        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                        privateKey: privateKey,
                    }),
                });
                console.log('Firebase admin initialized successfully with discrete environment variables');
            } else {
                console.warn('Firebase admin initialization skipped: Missing service account environment variables');
            }
        }
    } catch (error) {
        console.error('Firebase admin initialization error:', error);
    }
}

export const firebaseAdmin = admin;
