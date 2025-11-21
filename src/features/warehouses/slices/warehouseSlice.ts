import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchWarehouses } from "../api/warehouseService";

export type Warehouse = {
  id: number;
  name: string;
  country: string;
};

type WarehousesState = {
  list: Warehouse[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

const initialState: WarehousesState = {
  list: [],
  status: "idle",
  error: null,
};

export const loadWarehouses = createAsyncThunk("warehouses/load", async () => {
  const response = await fetchWarehouses();
  return response.data as Warehouse[];
});

const warehouseSlice = createSlice({
  name: "warehouses",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadWarehouses.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loadWarehouses.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(loadWarehouses.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to load warehouses";
      });
  },
});

export default warehouseSlice.reducer;
