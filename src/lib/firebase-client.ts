"use client";

import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration for NEW project fll-console
const firebaseConfig = {
  apiKey: "AIzaSyAflI4NzYKeNM6k_fguW8LEWKgWgGNS468",
  authDomain: "fll-console.firebaseapp.com",
  projectId: "fll-console",
  storageBucket: "fll-console.firebasestorage.app",
  messagingSenderId: "531231047175",
  appId: "1:531231047175:web:361d356fbf1cb4757d34a2"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Analytics is only supported in the browser
export const analytics = typeof window !== "undefined" ? isSupported().then(yes => yes ? getAnalytics(app) : null) : null;

export { app };
