import { create } from "zustand";

type MessageThreadState = {
  busy: boolean;
  selectedOrderId: number | null;
  setOrder: (id: number) => void;
  toggleBusy: (hasWork: boolean) => void;
};

export const useMessageThread = create<MessageThreadState>((set) => ({
  busy: false,
  selectedOrderId: null,
  setOrder(id) {
    set(() => ({ selectedOrderId: id }));
  },
  toggleBusy(hasWork) {
    set(() => ({ busy: hasWork }));
  },
}));
