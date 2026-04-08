"use client";

import { useEffect, useState } from "react";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import { initializeApp, getApps } from "firebase/app";

// Firebase config - get these from Firebase Console > Project Settings > General > Web App
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

export function useFirebaseMessaging() {
  const [token, setToken] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");
  const [isSupported_, setIsSupported] = useState(false);
  const [inAppNotification, setInAppNotification] = useState<any>(null);

  useEffect(() => {
    // Check if Firebase Cloud Messaging is supported in this browser
    isSupported().then((supported) => {
      setIsSupported(supported);
      if (!supported) {
        console.log("Firebase Cloud Messaging not supported in this browser");
      }
    });
  }, []);

  useEffect(() => {
    if (!isSupported_) return;

    // Validate Firebase config
    if (!firebaseConfig.projectId || !firebaseConfig.apiKey) {
      console.warn("Firebase config missing: NEXT_PUBLIC_FIREBASE_PROJECT_ID or NEXT_PUBLIC_FIREBASE_API_KEY not set");
      return;
    }

    const initMessaging = async () => {
      try {
        // Register service worker first (required for notifications)
        if ('serviceWorker' in navigator) {
          try {
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            console.log('Service Worker registered:', registration.scope);
          } catch (swError) {
            console.error('Service Worker registration failed:', swError);
          }
        }

        // Initialize Firebase
        const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
        const messaging = getMessaging(app);

        // Request permission
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);

        if (permission !== "granted") {
          console.log("Notification permission denied");
          return;
        }

        // Get FCM token - requires VAPID key
        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
        const currentToken = await getToken(messaging, {
          vapidKey: vapidKey,
        });

        if (currentToken) {
          console.log("FCM Token:", currentToken);
          setToken(currentToken);

          // Send token to your backend
          await fetch("/api/users/fcm-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: currentToken }),
          });
        } else {
          console.log("No registration token available");
        }

        // Handle foreground messages (when app is open)
        onMessage(messaging, (payload) => {
          console.log("Message received in foreground:", payload);
          setInAppNotification(payload);

          // Show native browser notification (macOS/Windows/Linux)
          if (Notification.permission === "granted") {
            const notification = new Notification(payload.notification?.title || "رسالة جديدة", {
              body: payload.notification?.body || "",
              icon: "/photos/logo.png",
              badge: "/photos/logo.png",
              tag: payload.data?.orderId || "default",
              data: payload.data,
              requireInteraction: true, // Keep notification until user interacts
            });

            // Play notification sound
            try {
              const audio = new Audio("/notification.mp3");
              audio.play().catch(() => {}); // Ignore autoplay errors
            } catch {
              // Audio not available
            }

            // Handle notification click
            notification.onclick = () => {
              window.focus();
              const orderId = payload.data?.orderId;
              if (orderId) {
                window.location.href = `/orders/${orderId}`;
              }
              notification.close();
            };
          }
        });
      } catch (error) {
        console.error("Error initializing Firebase messaging:", error);
      }
    };

    initMessaging();
  }, [isSupported_]);

  return { token, notificationPermission, inAppNotification, isSupported: isSupported_ };
}
