import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export type Role = "ADMIN" | "PURCHASE_OFFICER" | "CHINA_WAREHOUSE" | "LIBYA_WAREHOUSE" | "CUSTOMER";

export type User = {
  id: number;
  name: string;
  email: string;
  mobile?: string;
  photoUrl?: string;
  passportUrl?: string;
  role: Role;
  suspended: boolean;
  createdAt: string;
  customer?: {
    id: number;
    code: string;
    balanceUSD: number;
    balanceLYD: number;
    balanceCNY: number;
  };
};

type UserState = {
  list: User[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

const initialState: UserState = {
  list: [],
  status: "idle",
  error: null,
};

export const fetchUsers = createAsyncThunk("users/fetchUsers", async (filters?: Record<string, string | number>) => {
  let query = "";
  if (filters) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      params.set(key, String(value));
    });
    query = params.toString() ? `?${params.toString()}` : "";
  }
  const token = localStorage.getItem("token");
  const response = await fetch(`/api/users${query}`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }
  return response.json();
});

export const createUser = createAsyncThunk("users/createUser", async (data: Partial<User> & { password?: string }) => {
  const token = localStorage.getItem("token");
  const response = await fetch("/api/users", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create user");
  }
  return response.json();
});

export const updateUser = createAsyncThunk("users/updateUser", async ({ id, data }: { id: number; data: Partial<User> & { password?: string; customerCode?: string } }) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`/api/users/${id}`, {
    method: "PUT",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update user");
  }
  return response.json();
});

export const deleteUser = createAsyncThunk("users/deleteUser", async (id: number) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`/api/users/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete user");
  }
  return id;
});

export const suspendUser = createAsyncThunk("users/suspendUser", async ({ id, suspended }: { id: number; suspended: boolean }) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`/api/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ suspended })
  });
  if (!response.ok) {
    let errorMessage = "Failed to update user suspension status";
    try {
      const error = await response.json();
      errorMessage = error.error || errorMessage;
    } catch (e) {
      // If response is not JSON, use status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }
  
  // Try to parse JSON response, but if it's empty (204) or not JSON, just return the expected data
  let result;
  try {
    const responseText = await response.text();
    result = responseText ? JSON.parse(responseText) : null;
  } catch (e) {
    // If parsing fails, assume success and return the expected data
    result = null;
  }
  
  return { id, suspended };
});

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch users";
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.list.findIndex((user) => user.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.list = state.list.filter((user) => user.id !== action.payload);
      })
      .addCase(suspendUser.fulfilled, (state, action) => {
        const index = state.list.findIndex((user) => user.id === action.payload.id);
        if (index !== -1) {
          state.list[index].suspended = action.payload.suspended;
        }
      });
  },
});

export default userSlice.reducer;
