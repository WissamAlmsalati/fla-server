"use client";

import type { ReactNode } from "react";
import { ReduxProvider } from "@/redux/provider";

export function Providers({ children }: { children: ReactNode }) {
  return <ReduxProvider>{children}</ReduxProvider>;
}
