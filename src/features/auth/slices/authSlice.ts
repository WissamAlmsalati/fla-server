import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type AuthState = {
  user: { id: number; role: string } | null;
  status: "idle" | "loading" | "succeeded" | "failed";
};

const initialState: AuthState = {
  user: null,
  status: "idle",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<{ id: number; role: string }>) {
      state.user = action.payload;
      state.status = "succeeded";
    },
    clearUser(state) {
      state.user = null;
      state.status = "idle";
    },
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
