"use client";

import { useEffect } from "react";
import { setUser } from "@/features/auth/slices/authSlice";
import { useReduxDispatch } from "@/redux/provider";

export function useHydrateAuth(tokenPayload?: {
  sub: number;
  role: string;
  name: string;
  email: string;
  customerId?: number | null;
}) {
  const dispatch = useReduxDispatch();

  useEffect(() => {
    if (tokenPayload) {
      dispatch(setUser({
        id: tokenPayload.sub,
        role: tokenPayload.role,
        name: tokenPayload.name,
        email: tokenPayload.email,
        customerId: tokenPayload.customerId
      }));
    }
  }, [dispatch, tokenPayload]);
}
