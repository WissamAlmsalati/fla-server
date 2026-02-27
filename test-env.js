const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const keyMatch = env.match(/FIREBASE_PRIVATE_KEY="(.*?)"/s);
if (keyMatch) {
    let rawKey = keyMatch[1];
    console.log("Raw matched string:", JSON.stringify(rawKey));
    let parsedKey = rawKey.replace(/\\n/g, '\n');
    console.log("Parsed result includes actual newline?", parsedKey.includes('\n'));
    console.log("First 60 chars:", JSON.stringify(parsedKey.substring(0, 60)));
} else {
    console.log("No FIREBASE_PRIVATE_KEY found in .env");
}
