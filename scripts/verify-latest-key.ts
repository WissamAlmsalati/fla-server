import { GoogleAuth } from 'google-auth-library';
import fs from 'fs';

async function verifyNewKey() {
    const keyData = {
  "type": "service_account",
  "project_id": "fll-system-c2965",
  "private_key_id": "5da22a282c5f5bf3d6f8a05f358fc778dd0736ee",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC/H97bz7HRsXHJ\nRF1W7CiJyEnyaYuEVQkTaj3yhz9wIeB23IsGBuB9tnKdv80utJCe+A3rtJOebO3k\nhYTRGHmgzWqlrS4LkBMCSOaTKIBWZMDi6xPDyVqImLEM1Gvxehr6WrJSNiX0wdby\niG9K3D4B6xg3Qv/kffc8kD+4TlPeNOPqjmn6evmO3EZkWUzJdIAfLpALa2JJsSrx\nOE976zOl5dka0IrfrCMJxw2W4PkC+3R8xH4xvsQi11eAdZs6bPt7FHIHrgdKRXSF\nmWsdf5ixFz1vlfW0xXvEVmiWxJbZpvqXVtst4vUM/LmbpoPDGuVHQ1+snVNrhy6n\nFmsoPSKzAgMBAAECgf8/1OUZhMRexGS8U5jY7waa/cm0rItsJvphAZqu5XzKdoYB\nLKdB3Aod8lFVXjmo36VtcmszzZt/zeGl8PHq48G7ct+rdatrMTMoEDDx9RTnxb6m\nCt0PBrC17kkzf76NZ7qa4q+rxWnn1NV1KxwAZI5RFbOAwV+1cFyiXYrqgz5/d5X+\nIx2e5I3zqbeiWlPLNfd/kmh8v/fAWfIS7wT1/JgwTXbh65dZZ8REOuHLaFyxLRfJ\nWdIiOEh15H/KSzWBUiif5rwV/GiLX6nxEGrzviZKhAc/Qz7eAFBBpYUEl46+PZ3w\nBOs4a9pQUdfxAknk2utYyteR+1u2MaDDpQULZLECgYEA9x7aMrFsVka8L9YXHgxv\nLCbh3HLXPqZAjFwWg2j6BDkkHqdc3oIDoveRr7FDSahVPpyXQBdj0acUANf+yP4V\nZ6BK9aUUan48FRXqhn2BP47lRHyxVsCsZR3T8e6jT1RnqDcqs3GC4rMlmffuFEgb\nWlsHKQmK0qvBNmPrh+WHqhECgYEAxf3vxjuO3KLLvtXoeScy9Qcnjf3oHCY6IoyC\n0+AF+oCG4lFdS776fg85aczLoBWrWGuSuOjUda+ihgRn2lK1Zxr7T4Lf/gQUudBP\ngEWwMhu2QYS8OMNz3ny2COCvRoRasChffFoMBCxpXbwdjDczAJZEoVc/oRrwXjBi\n7SyDXIMCgYEAzRxyhzj0bvfvItVUAsDXVZJATbWUKo/ba6TTmub6/Z5f+IF5d8X6\nNr290lITQ4PQnVNjxvKjC1TeKYUeGL2sDoLhNNp8A5gbTnUOX+qz6Ik2io3ks9jg\nPl1vmZM1QZcRInIHo0FIHdoMD6vVlEf1TB3Z55nf+9RLXlW5HObKn8ECgYEAjnuX\YSYdQmSZkYUo3n86KaFzcrjFn/RWo+RQhh9SzhpOd3IsXMVcSPm1zJDH/TV68I/B\nr/ZGZ0b1A9MJ1dDtoPyG3IqHnarcK3hgriP4j6bnuzDFr2fg67z911eya2H2TY1Q\nYhH/UcWQMhedf/l9Z6+8Rguey9ayImZZ2urMwfcCgYEAkzp0xlbMQdLqjvlqQl0s\nBAbk8rhi4TtqVMxAeMgvkXuO4COW4P6dXNm22hl8QFWtZpO7/29jqeJhDaUAJLah\nzPWkvBn9O5WpOv/3bHmgtltEJAjqoNXxLrrl4BWi0+x3thhINiX1aNenEp2G3RQD\nF5VG112KBZDcciEwW/pqEuI=\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@fll-system-c2965.iam.gserviceaccount.com",
  "client_id": "101296387307323643533",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40fll-system-c2965.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

    fs.writeFileSync('temp-key-2.json', JSON.stringify(keyData));

    try {
        const auth = new GoogleAuth({
            keyFile: 'temp-key-2.json',
            scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
        });
        
        const client = await auth.getClient();
        const tokenResponse = await client.getAccessToken();
        const accessToken = tokenResponse.token;
        
        console.log('Token obtained.');
        
        const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${accessToken}`);
        const info = await response.json();
        console.log('Token Details:', JSON.stringify(info, null, 2));
    } catch (e: any) {
        console.error('Verification failed:', e.message);
    } finally {
        if (fs.existsSync('temp-key-2.json')) fs.unlinkSync('temp-key-2.json');
    }
}

verifyNewKey();
