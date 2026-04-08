"use client";

import { useEffect } from "react";
import { useFirebaseMessaging } from "@/hooks/use-firebase-messaging";
import { toast } from "sonner";

export function FirebaseNotifications() {
  const { token, inAppNotification } = useFirebaseMessaging();

  useEffect(() => {
    if (token) {
      console.log("Firebase notifications enabled, token:", token.substring(0, 20) + "...");
    }
  }, [token]);

  useEffect(() => {
    if (inAppNotification) {
      // Show toast notification when message arrives while app is open
      toast(inAppNotification.notification?.title || "رسالة جديدة", {
        description: inAppNotification.notification?.body || "",
        duration: 5000,
      });

      // Optional: Play sound
      // const audio = new Audio("/notification-sound.mp3");
      // audio.play().catch(() => {});
    }
  }, [inAppNotification]);

  return null; // This component doesn't render anything
}
