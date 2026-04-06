import * as admin from 'firebase-admin';
import * as fs from 'fs';

async function testDirectFCM() {
    try {
        const serviceAccount = JSON.parse(fs.readFileSync('service-account.json', 'utf8'));
        
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        }
        
        console.log("Initialized with project:", serviceAccount.project_id);
        
        const token = "d_W0-ZIBuENAt_uI4y5qw0:APA91bGwG1Q4dzXV6hF97169pUfVLJpIW4JF1IM9wqP0_ovMz-_RQMKDhqujoMvau52yB8y6FInrWElBhMdhnokN2w3Yflj7-DawXav_hT-JaAbZ5R4bQL4";
        
        const message = {
            notification: {
                title: 'Test',
                body: 'Test Body'
            },
            token: token
        };
        
        try {
            const response = await admin.messaging().send(message);
            console.log('Successfully sent message:', response);
        } catch (error: any) {
            console.error('Error sending message:', error);
            if (error.errorInfo) {
                console.error('Error Info:', JSON.stringify(error.errorInfo, null, 2));
            }
        }
    } catch (e: any) {
        console.error('Script Error:', e.message);
    }
}

testDirectFCM();
