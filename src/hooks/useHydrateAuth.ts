"use client";

import { useEffect } from "react";
import { setUser } from "@/features/auth/slices/authSlice";
import { useReduxDispatch } from "@/redux/provider";

export function useHydrateAuth(tokenPayload?: { id: number; role: string }) {
  const dispatch = useReduxDispatch();

  useEffect(() => {
    if (tokenPayload) {
      dispatch(setUser(tokenPayload));
    }
  }, [dispatch, tokenPayload]);
}
