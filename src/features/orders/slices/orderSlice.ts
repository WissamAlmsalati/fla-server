import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchOrders, createOrder } from "@/features/orders/api/ordersService";

export type Order = {
  id: number;
  trackingNumber: string;
  name: string;
  status: string;
  usdPrice: number;
  customerId: number;
};

type OrdersState = {
  list: Order[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

const initialState: OrdersState = {
  list: [],
  status: "idle",
  error: null,
};

export const loadOrders = createAsyncThunk("orders/load", async (filters?: Record<string, string | number>) => {
  const response = await fetchOrders(filters);
  return response.data as Order[];
});

export const addOrder = createAsyncThunk("orders/create", async (payload: Parameters<typeof createOrder>[0]) => {
  const response = await createOrder(payload);
  return response.data as Order;
});

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadOrders.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loadOrders.fulfilled, (state, action) => {
        state.list = action.payload;
        state.status = "succeeded";
      })
      .addCase(loadOrders.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Unable to load orders";
      })
      .addCase(addOrder.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      });
  },
});

export default orderSlice.reducer;
