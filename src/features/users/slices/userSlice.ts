import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export type Role = "ADMIN" | "PURCHASE_OFFICER" | "CHINA_WAREHOUSE" | "LIBYA_WAREHOUSE" | "CUSTOMER";

export type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
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

export const fetchUsers = createAsyncThunk("users/fetchUsers", async () => {
  const token = localStorage.getItem("token");
  const response = await fetch("/api/users", {
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
      });
  },
});

export default userSlice.reducer;
