import { create } from "zustand";

type WarehouseFilterState = {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
};

export const useWarehouseFilters = create<WarehouseFilterState>((set) => ({
  searchTerm: "",
  setSearchTerm(value) {
    set(() => ({ searchTerm: value }));
  },
}));
