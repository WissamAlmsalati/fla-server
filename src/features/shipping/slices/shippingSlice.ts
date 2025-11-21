import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export type ShippingType = "AIR" | "SEA";

export type ShippingRate = {
  id: number;
  type: ShippingType;
  name: string;
  price: number;
  createdAt: string;
  updatedAt: string;
};

type ShippingState = {
  rates: ShippingRate[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

const initialState: ShippingState = {
  rates: [],
  status: "idle",
  error: null,
};

export const loadRates = createAsyncThunk("shipping/loadRates", async () => {
  const token = localStorage.getItem("token");
  const response = await fetch("/api/shipping-rates", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch rates");
  }
  return response.json();
});

export const createRate = createAsyncThunk(
  "shipping/createRate",
  async (data: { type: ShippingType; name: string; price: number }) => {
    const token = localStorage.getItem("token");
    const response = await fetch("/api/shipping-rates", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create rate");
    return response.json();
  }
);

export const updateRate = createAsyncThunk(
  "shipping/updateRate",
  async ({ id, data }: { id: number; data: Partial<ShippingRate> }) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`/api/shipping-rates/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update rate");
    return response.json();
  }
);

export const deleteRate = createAsyncThunk("shipping/deleteRate", async (id: number) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`/api/shipping-rates/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to delete rate");
  return id;
});

const shippingSlice = createSlice({
  name: "shipping",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadRates.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loadRates.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.rates = action.payload;
      })
      .addCase(loadRates.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Error";
      })
      .addCase(createRate.fulfilled, (state, action) => {
        state.rates.unshift(action.payload);
      })
      .addCase(updateRate.fulfilled, (state, action) => {
        const index = state.rates.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.rates[index] = action.payload;
        }
      })
      .addCase(deleteRate.fulfilled, (state, action) => {
        state.rates = state.rates.filter((r) => r.id !== action.payload);
      });
  },
});

export default shippingSlice.reducer;
