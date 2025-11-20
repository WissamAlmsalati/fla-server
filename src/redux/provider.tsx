import { PropsWithChildren, createContext, useContext, useMemo, useSyncExternalStore } from "react";
import { store, RootState } from "./store";

const ReduxStoreContext = createContext<typeof store | null>(null);

export function ReduxProvider({ children }: PropsWithChildren) {
  const value = useMemo(() => store, []);
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
