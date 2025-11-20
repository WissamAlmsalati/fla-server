import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type Warehouse = {
  id: number;
  name: string;
  country: string;
};

type WarehousesState = {
  list: Warehouse[];
  status: "idle" | "loading" | "succeeded" | "failed";
};

const initialState: WarehousesState = {
  list: [],
  status: "idle",
};

const warehouseSlice = createSlice({
  name: "warehouses",
  initialState,
  reducers: {
    setWarehouses(state, action: PayloadAction<Warehouse[]>) {
      state.list = action.payload;
      state.status = "succeeded";
    },
  },
});

export const { setWarehouses } = warehouseSlice.actions;
export default warehouseSlice.reducer;
