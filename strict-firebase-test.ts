import * as admin from 'firebase-admin';
import * as path from 'path';

const serviceAccountPath = path.join(process.cwd(), 'service-account.json');
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

async function testFirebase() {
    try {
        const token = "d1xSG-zMLkRClI-jHwxmi1:APA91bHLJWxrt8fMWDk8fRFRSxPNLGmKH0eqgnhrdvfXxhmXD7Lo4mcaardT-L-d1HAlNRLFEuwFTYcWM7iop3BKhk9zLDldJ1eC8kmy_gMP-94HtUYtcm8";

        const message = {
            notification: {
                title: "Direct Test",
                body: "Explicit service-account.json test"
            },
            token: token
        };

        const response = await admin.messaging().send(message);
        console.log("Success! Message ID:", response);
    } catch (error) {
        console.error("Firebase Test Error:", error);
    }
}

testFirebase();
