importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase config - Replace these with your actual values from Firebase Console
// Go to: Firebase Console > Project Settings > General > Web App
const firebaseConfig = {
  apiKey: "AIzaSyDx-IYv-rArE4XPMkX8q2dOq8MRS4z5QhE",
  authDomain: "fll-console.firebaseapp.com",
  projectId: "fll-console",
  storageBucket: "fll-console.firebasestorage.app",
  messagingSenderId: "531231047175",
  appId: "1:531231047175:web:361d356fbf1cb4757d34a2"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background messages (when browser is closed/minimized)
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message', payload);

  const notificationTitle = payload.notification?.title || 'رسالة جديدة';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/photos/logo.png',
    badge: '/photos/logo.png',
    tag: payload.data?.orderId || 'default',
    data: payload.data,
    requireInteraction: true,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const orderId = event.notification.data?.orderId;
  const urlToOpen = orderId
    ? `/orders/${orderId}`
    : '/orders';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window client is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
