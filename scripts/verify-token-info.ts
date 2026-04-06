import { GoogleAuth } from 'google-auth-library';
import axios from 'axios';

async function verifyToken() {
    try {
        const auth = new GoogleAuth({
            keyFile: 'service-account.json',
            scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
        });
        
        const client = await auth.getClient();
        const tokenResponse = await client.getAccessToken();
        const accessToken = tokenResponse.token;
        
        console.log('Access Token obtained.');
        
        const infoUrl = `https://oauth2.googleapis.com/tokeninfo?access_token=${accessToken}`;
        const resp = await axios.get(infoUrl);
        console.log('Token Info:', JSON.stringify(resp.data, null, 2));
    } catch (e: any) {
        console.error('Failed to verify token:', e.message);
    }
}

verifyToken();
