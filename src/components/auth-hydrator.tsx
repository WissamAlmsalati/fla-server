"use client";

import { useEffect, useRef } from "react";
import { useReduxDispatch } from "@/redux/provider";
import { setUser } from "@/features/auth/slices/authSlice";

// Safe client-side JWT decoder
function decodeJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function AuthHydrator() {
  const dispatch = useReduxDispatch();
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current) return;
    
    // Try localStorage first (as set in login-form)
    let token = localStorage.getItem("token");
    
    // Fallback to cookie
    if (!token && typeof document !== 'undefined') {
      const match = document.cookie.match(new RegExp('(^| )access_token=([^;]+)'));
      if (match) token = match[2];
    }

    if (token) {
      const payload = decodeJwt(token);
      if (payload && payload.sub) {
        dispatch(setUser({
          id: payload.sub,
          role: payload.role,
          name: payload.name,
          email: payload.email,
          customerId: payload.customerId,
        }));
      }
    }
    
    hydrated.current = true;
  }, [dispatch]);

  return null;
}
