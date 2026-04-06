const keys = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL'
];

keys.forEach(key => {
  console.log(`${key}: "${process.env[key]}"`);
});

export {};
