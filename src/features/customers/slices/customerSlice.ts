import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export type Customer = {
  id: number;
  name: string;
  code: string;
  userId: number | null;
  balanceUSD: number;
  balanceLYD: number;
  balanceCNY: number;
  user?: {
    id: number;
    name: string;
    email: string;
    mobile?: string;
    photoUrl?: string;
    passportUrl?: string;
    role: string;
    createdAt: string;
  };
  _count?: {
    orders: number;
  };
};

type CustomerState = {
  list: Customer[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

const initialState: CustomerState = {
  list: [],
  status: "idle",
  error: null,
};

export const fetchCustomers = createAsyncThunk("customers/fetchCustomers", async () => {
  const token = localStorage.getItem("token");
  const response = await fetch("/api/customers", {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  if (!response.ok) {
    throw new Error("Failed to fetch customers");
  }
  return response.json();
});

export const createCustomer = createAsyncThunk("customers/createCustomer", async (data: { name: string; userId?: number }) => {
  const token = localStorage.getItem("token");
  const response = await fetch("/api/customers", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create customer");
  }
  return response.json();
});

export const updateCustomer = createAsyncThunk("customers/updateCustomer", async (data: { id: number; balanceUSD?: number; balanceLYD?: number; balanceCNY?: number }) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`/api/customers/${data.id}`, {
    method: "PATCH",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update customer");
  }
  return response.json();
});

const customerSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch customers";
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        const index = state.list.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      });
  },
});

export default customerSlice.reducer;
