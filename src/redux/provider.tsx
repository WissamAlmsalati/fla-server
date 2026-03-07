import { PropsWithChildren, createContext, useContext, useMemo, useSyncExternalStore, useEffect } from "react";
import { store, RootState } from "./store";
import { clearUser } from "@/features/auth/slices/authSlice";

const ReduxStoreContext = createContext<typeof store | null>(null);

export function ReduxProvider({ children }: PropsWithChildren) {
  const value = useMemo(() => store, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const originalFetch = window.fetch;

    window.fetch = async function (...args) {
      const response = await originalFetch.apply(this, args);

      // If response is 401 Unauthorized from our API, log the user out
      if (response.status === 401) {
        const url = args[0] as string | Request | URL;
        const urlString = typeof url === 'string' ? url : (url && 'url' in url ? url.url : url?.toString() || '');
        
        // Ensure it's not the generic login or refresh failing normally
        if (urlString.includes("/api/") && !urlString.includes("/api/auth/login")) {
          // Check if there's a token - if there is, it expired.
          const token = localStorage.getItem("token");
          if (token) {
            localStorage.removeItem("token");
            store.dispatch(clearUser());
            window.location.href = "/auth/login?expired=true";
          }
        }
      }

      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return <ReduxStoreContext.Provider value={value}>{children}</ReduxStoreContext.Provider>;
}

export function useReduxDispatch() {
  const reduxStore = useContext(ReduxStoreContext);
  if (!reduxStore) throw new Error("Redux store not available");
  return reduxStore.dispatch;
}

export function useReduxSelector<T>(selector: (state: RootState) => T) {
  const reduxStore = useContext(ReduxStoreContext);
  if (!reduxStore) throw new Error("Redux store not available");
  return useSyncExternalStore(
    reduxStore.subscribe,
    () => selector(reduxStore.getState()),
    () => selector(reduxStore.getState()),
  );
}
