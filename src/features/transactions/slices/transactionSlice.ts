import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type {
    Transaction,
    CreateTransactionInput,
    TransactionFilters,
} from "../types";

interface TransactionState {
    list: Transaction[];
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
}

const initialState: TransactionState = {
    list: [],
    status: "idle",
    error: null,
};

// Async thunks
export const createTransaction = createAsyncThunk(
    "transactions/create",
    async (input: CreateTransactionInput, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("/api/transactions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(input),
            });

            if (!response.ok) {
                const error = await response.json();
                return rejectWithValue(error.error || "Failed to create transaction");
            }

            return await response.json();
        } catch (error: any) {
            return rejectWithValue(error.message || "Network error");
        }
    }
);

export const fetchTransactions = createAsyncThunk(
    "transactions/fetch",
    async (filters: TransactionFilters, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            const params = new URLSearchParams({
                customerId: filters.customerId.toString(),
            });

            if (filters.currency) params.append("currency", filters.currency);
            if (filters.type) params.append("type", filters.type);
            if (filters.startDate) params.append("startDate", filters.startDate);
            if (filters.endDate) params.append("endDate", filters.endDate);

            const response = await fetch(`/api/transactions?${params}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                return rejectWithValue(error.error || "Failed to fetch transactions");
            }

            return await response.json();
        } catch (error: any) {
            return rejectWithValue(error.message || "Network error");
        }
    }
);

const transactionSlice = createSlice({
    name: "transactions",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Create transaction
            .addCase(createTransaction.pending, (state) => {
                state.status = "loading";
            })
            .addCase(createTransaction.fulfilled, (state, action: PayloadAction<Transaction>) => {
                state.status = "succeeded";
                state.list.unshift(action.payload); // Add to beginning of list
                state.error = null;
            })
            .addCase(createTransaction.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload as string;
            })
            // Fetch transactions
            .addCase(fetchTransactions.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchTransactions.fulfilled, (state, action: PayloadAction<Transaction[]>) => {
                state.status = "succeeded";
                state.list = action.payload;
                state.error = null;
            })
            .addCase(fetchTransactions.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload as string;
            });
    },
});

export default transactionSlice.reducer;
