import { create } from "zustand";

type FilterState = {
  status: string;
  customerId?: number;
  setFilter: (field: keyof Omit<FilterState, "setFilter">, value: string | number | undefined) => void;
};

export const useOrderFilters = create<FilterState>((set) => ({
  status: "all",
  customerId: undefined,
  setFilter(field, value) {
    set((state) => ({ ...state, [field]: value }));
  },
}));
