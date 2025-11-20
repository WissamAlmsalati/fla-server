import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type MessageState = {
  thread: Record<string, unknown>[];
  status: "idle" | "loading" | "succeeded" | "failed";
};

const initialState: MessageState = {
  thread: [],
  status: "idle",
};

const messageSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    upsertThread(state, action: PayloadAction<Record<string, unknown>[]>) {
      state.thread = action.payload;
      state.status = "succeeded";
    },
  },
});

export const { upsertThread } = messageSlice.actions;
export default messageSlice.reducer;
