import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchOrders, createOrder, updateOrder as updateOrderApi } from "@/features/orders/api/ordersService";

export type Order = {
  id: number;
  trackingNumber: string;
  name: string;
  status: string;
  usdPrice: number;
  cnyPrice?: number;
  customerId: number;
  weight?: number;
  shippingRateId?: number;
  shippingCost?: number;
  shippingRate?: {
    id: number;
    name: string;
    type: string;
    price: number;
    country?: string;
  };
  productUrl?: string;
  notes?: string;
  flightNumber?: string;
  createdAt: string;
  updatedAt: string;
  country?: string;
  customer?: {
    id: number;
    code: string;
    dubaiCode?: string;
    usaCode?: string;
    turkeyCode?: string;
    user?: {
      id: number;
      name: string;
    };
  };
  unreadCount?: number;
  logs?: {
    id: number;
    status: string;
    note?: string;
    createdAt: string;
  }[];
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

export const updateOrder = createAsyncThunk("orders/update", async ({ id, data }: { id: number; data: Parameters<typeof updateOrderApi>[1] }) => {
  const response = await updateOrderApi(id, data);
  return response as Order;
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
        state.error = action.error.message || "Failed to load orders";
      })
      .addCase(addOrder.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        const index = state.list.findIndex((o) => o.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      });
  },
});

export default orderSlice.reducer;
