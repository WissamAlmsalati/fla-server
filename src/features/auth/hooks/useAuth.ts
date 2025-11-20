"use client";

import { useReduxSelector } from "@/redux/provider";

export function useAuth() {
  return useReduxSelector((state) => state.auth);
}
