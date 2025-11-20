import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type Shipment = {
  id: number;
  shipmentId: string;
  status: string;
};

type ShipmentsState = {
  list: Shipment[];
  status: "idle" | "loading" | "succeeded" | "failed";
};

const initialState: ShipmentsState = {
  list: [],
  status: "idle",
};

const shipmentSlice = createSlice({
  name: "shipments",
  initialState,
  reducers: {
    setShipments(state, action: PayloadAction<Shipment[]>) {
      state.list = action.payload;
      state.status = "succeeded";
    },
  },
});

export const { setShipments } = shipmentSlice.actions;
export default shipmentSlice.reducer;
