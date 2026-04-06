import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// Protect from re-initializing in dev environments like Next.js
if (!admin.apps.length) {
    try {
        // Expected environment variables from Firebase Console -> Project Settings -> Service Accounts
        const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

        if (serviceAccountStr) {
            try {
                const serviceAccount = JSON.parse(serviceAccountStr);
                
                // Also apply cleaning to the private key inside the JSON if it exists
                if (serviceAccount.private_key) {
                    let pk = serviceAccount.private_key;
                    
                    // 1. Handle literal \n if they exist
                    pk = pk.replace(/\\n/g, '\n');
                    
                    // 2. Remove surrounding quotes
                    if (pk.startsWith('"') && pk.endsWith('"')) pk = pk.substring(1, pk.length - 1);
                    if (pk.startsWith("'") && pk.endsWith("'")) pk = pk.substring(1, pk.length - 1);
                    
                    // 3. Clean up the Base64 content - this is the most common cause of ASN.1 errors
                    if (pk.includes('-----BEGIN PRIVATE KEY-----')) {
                        const parts = pk.split('-----BEGIN PRIVATE KEY-----');
                        const afterHeader = parts[1].split('-----END PRIVATE KEY-----');
                        const header = '-----BEGIN PRIVATE KEY-----';
                        const footer = '-----END PRIVATE KEY-----';
                        // Remove all whitespace from the Base64 part and re-insert newlines
                        const base64 = afterHeader[0].replace(/\s/g, '');
                        pk = `${header}\n${base64}\n${footer}\n`;
                    }
                    
                    serviceAccount.private_key = pk;
                }

                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount)
                });
                console.log('Firebase admin initialized successfully with service account JSON');
            } catch (jsonError: any) {
                console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:', jsonError.message);
            }
        } else {
            const serviceAccountPath = path.join(process.cwd(), 'service-account.json');
            if (fs.existsSync(serviceAccountPath)) {
                try {
                    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
                    
                    // Apply robust cleaning to the private key
                    if (serviceAccount.private_key) {
                        let pk = serviceAccount.private_key;
                        pk = pk.replace(/\\n/g, '\n');
                        if (pk.startsWith('"') && pk.endsWith('"')) pk = pk.substring(1, pk.length - 1);
                        if (pk.startsWith("'") && pk.endsWith("'")) pk = pk.substring(1, pk.length - 1);
                        
                        if (pk.includes('-----BEGIN PRIVATE KEY-----')) {
                            const parts = pk.split('-----BEGIN PRIVATE KEY-----');
                            const afterHeader = parts[1].split('-----END PRIVATE KEY-----');
                            const header = '-----BEGIN PRIVATE KEY-----';
                            const footer = '-----END PRIVATE KEY-----';
                            const base64 = afterHeader[0].replace(/\s/g, '');
                            pk = `${header}\n${base64}\n${footer}\n`;
                        }
                        serviceAccount.private_key = pk;
                    }

                    admin.initializeApp({
                        credential: admin.credential.cert(serviceAccount),
                        // Explicit projectId can help with FCM auth
                        projectId: serviceAccount.project_id
                    });
                    console.log('Firebase admin initialized successfully with local service-account.json file');
                } catch (fileError: any) {
                    console.warn('Failed to parse local service-account.json file:', fileError.message);
                }
            } else if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_PROJECT_ID) {
                const projectId = process.env.FIREBASE_PROJECT_ID.trim();
                const clientEmail = process.env.FIREBASE_CLIENT_EMAIL.trim();
                let privateKey = process.env.FIREBASE_PRIVATE_KEY.trim();

                // Cleaning logic
                privateKey = privateKey.replace(/\\n/g, '\n');
                if (privateKey.startsWith('"') && privateKey.endsWith('"')) privateKey = privateKey.substring(1, privateKey.length - 1);
                
                try {
                    admin.initializeApp({
                        credential: admin.credential.cert({
                            projectId,
                            clientEmail,
                            privateKey,
                        }),
                        projectId: projectId 
                    });
                    console.log(`Firebase admin initialized successfully for project: ${projectId} ✅`);
                } catch (initError: any) {
                    console.error('Failed to initialize Firebase admin:', initError.message);
                }
            } else {
                console.warn('Firebase admin initialization skipped: Missing service account environment variables or file');
            }
        }
    } catch (error) {
        console.error('Firebase admin initialization error:', error);
    }
}

export const firebaseAdmin = admin;
