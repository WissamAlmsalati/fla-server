import { create } from "zustand";

type ShipmentUIState = {
  hoverId: number | null;
  detailOpen: boolean;
  setHoverId: (id: number | null) => void;
  setDetailOpen: (open: boolean) => void;
};

export const useShipmentUI = create<ShipmentUIState>((set) => ({
  hoverId: null,
  detailOpen: false,
  setHoverId(id) {
    set(() => ({ hoverId: id }));
  },
  setDetailOpen(open) {
    set(() => ({ detailOpen: open }));
  },
}));
