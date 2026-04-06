import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

let privateKey = process.env.FIREBASE_PRIVATE_KEY || '';
privateKey = privateKey.replace(/\\n/g, '\n');
if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.substring(1, privateKey.length - 1);
}

admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
    })
});

async function main() {
    const token = "dA2xvrsA90VuhjTxzmnxXZ:APA91bG_M-DAShljMOmHx8hXK85f5FIJWoF4xKCcPCjmYmN3KCMM4BBCeMcr8YZVlCNjJMBuNMmRr41qvdVr57OdC0KBhoCW-3uybBHBc265VNnLLS9-bjM";
    try {
        const res = await admin.messaging().send({ token, notification: { title: "Test from env", body: "Direct test from backend env" } });
        console.log("Success:", res);
    } catch (e) {
        console.error("Error sending:", e);
    }
}
main();
