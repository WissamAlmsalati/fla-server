import { GoogleAuth } from 'google-auth-library';
import fs from 'fs';
import axios from 'axios';

async function testCurl() {
    try {
        const auth = new GoogleAuth({
            keyFile: 'service-account.json',
            scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
        });
        
        const client = await auth.getClient();
        const tokenResponse = await client.getAccessToken();
        const accessToken = tokenResponse.token;
        
        const serviceAccount = JSON.parse(fs.readFileSync('service-account.json', 'utf8'));
        const projectId = serviceAccount.project_id;
        
        const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;
        const fcmToken = "d_W0-ZIBuENAt_uI4y5qw0:APA91bGwG1Q4dzXV6hF97169pUfVLJpIW4JF1IM9wqP0_ovMz-_RQMKDhqujoMvau52yB8y6FInrWElBhMdhnokN2w3Yflj7-DawXav_hT-JaAbZ5R4bQL4";
        
        const data = {
            message: {
                notification: {
                    title: "Manual Test",
                    body: "Manual Body"
                },
                token: fcmToken
            }
        };
        
        console.log(`Sending to: ${url}`);
        
        try {
            const resp = await axios.post(url, data, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('FCM Success:', resp.data);
        } catch (error: any) {
            console.error('FCM Failed:', error.message);
            if (error.response) {
                console.error('FCM Error Response:', JSON.stringify(error.response.data, null, 2));
            }
        }
    } catch (e: any) {
        console.error('Global Error:', e.message);
    }
}

testCurl();
