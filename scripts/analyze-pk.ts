import fs from 'fs';

try {
    const content = fs.readFileSync('service-account.json', 'utf8');
    const json = JSON.parse(content);
    
    let pk = json.private_key;
    if (pk.includes('-----BEGIN PRIVATE KEY-----')) {
        const parts = pk.split('-----BEGIN PRIVATE KEY-----');
        const afterHeader = parts[1].split('-----END PRIVATE KEY-----');
        const base64 = afterHeader[0].replace(/\s/g, '');
        
        console.log('Base64 length:', base64.length);
        console.log('Multiple of 4?', base64.length % 4 === 0);
        
        const illegalChars = base64.match(/[^A-Za-z0-9+/=]/g);
        if (illegalChars) {
            console.log('Illegal characters found:', Array.from(new Set(illegalChars)).join(' '));
        } else {
            console.log('No illegal characters found in Base64 block.');
        }
        
        // Show first and last 20 characters of Base64
        console.log('Base64 start:', base64.substring(0, 20));
        console.log('Base64 end:', base64.substring(base64.length - 20));
    }
} catch (e: any) {
    console.error('Error:', e.message);
}
