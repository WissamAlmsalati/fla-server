import { GoogleAuth } from 'google-auth-library';
import fs from 'fs';

async function getAccessToken() {
    try {
        const auth = new GoogleAuth({
            keyFile: 'service-account.json',
            scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
        });
        
        const client = await auth.getClient();
        const tokenResponse = await client.getAccessToken();
        console.log(tokenResponse.token);
    } catch (e: any) {
        process.exit(1);
    }
}

getAccessToken();
