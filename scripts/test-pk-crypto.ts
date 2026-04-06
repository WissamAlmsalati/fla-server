import fs from 'fs';
import crypto from 'crypto';

try {
    const content = fs.readFileSync('service-account.json', 'utf8');
    const json = JSON.parse(content);
    console.log('JSON parsed successfully');
    
    let pk = json.private_key;
    console.log('Original PK length:', pk.length);
    
    // Test if crypto can sign with it
    try {
        const sign = crypto.createSign('RSA-SHA256');
        sign.update('test');
        sign.sign(pk);
        console.log('Crypto signed successfully with original PK');
    } catch (cryptoError: any) {
        console.error('Crypto failed with original PK:', cryptoError.message);
        
        // Try cleaning
        let cleanedPk = pk.replace(/\\n/g, '\n');
        try {
            const sign = crypto.createSign('RSA-SHA256');
            sign.update('test');
            sign.sign(cleanedPk);
            console.log('Crypto signed successfully with cleaned PK (\\n replacement)');
        } catch (cleanError: any) {
            console.error('Crypto failed with cleaned PK (\\n replacement):', cleanError.message);
            
            // Try aggressive cleaning
            if (cleanedPk.includes('-----BEGIN PRIVATE KEY-----')) {
                const parts = cleanedPk.split('-----BEGIN PRIVATE KEY-----');
                const afterHeader = parts[1].split('-----END PRIVATE KEY-----');
                const base64 = afterHeader[0].replace(/\s/g, '');
                const finalPk = `-----BEGIN PRIVATE KEY-----\n${base64}\n-----END PRIVATE KEY-----\n`;
                
                try {
                    const sign = crypto.createSign('RSA-SHA256');
                    sign.update('test');
                    sign.sign(finalPk);
                    console.log('Crypto signed successfully with aggressive cleaned PK');
                } catch (aggError: any) {
                    console.error('Crypto failed with aggressive cleaned PK:', aggError.message);
                }
            }
        }
    }
} catch (e: any) {
    console.error('General error:', e.message);
}
