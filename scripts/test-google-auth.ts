import { GoogleAuth } from 'google-auth-library';
import fs from 'fs';

async function testAuth() {
    try {
        const auth = new GoogleAuth({
            keyFile: 'service-account.json',
            scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
        });
        
        console.log('Attempting to get access token...');
        const client = await auth.getClient();
        const token = await client.getAccessToken();
        
        console.log('Successfully got access token!');
        console.log('Token starts with:', token.token?.substring(0, 20));
    } catch (e: any) {
        console.error('Auth failed:', e.message);
        if (e.response) {
            console.error('Response data:', JSON.stringify(e.response.data, null, 2));
        }
    }
}

testAuth();
