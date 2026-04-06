const keys = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY'
];

keys.forEach(key => {
  const value = process.env[key];
  if (value) {
    console.log(`${key} is set. Length: ${value.length}`);
    if (key === 'FIREBASE_PRIVATE_KEY') {
      console.log('Private key starts with:', value.substring(0, 30));
      console.log('Private key ends with:', value.substring(value.length - 30));
      console.log('Contains literal newlines:', value.includes('\n'));
      console.log('Contains escaped newlines (\\n):', value.includes('\\n'));
    }
  } else {
    console.log(`${key} is NOT set.`);
  }
});
