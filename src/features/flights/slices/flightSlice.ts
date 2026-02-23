import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export interface Flight {
    id: number;
    flightNumber: string;
    status: string;
    departureDate: string | null;
    arrivalDate: string | null;
    country: string;
    type?: "AIR" | "SEA";
    createdAt: string;
    updatedAt: string;
    orders?: any[];
    _count?: {
        orders: number;
    };
}

interface FlightState {
    list: Flight[];
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
}

const initialState: FlightState = {
    list: [],
    status: "idle",
    error: null,
};

export const fetchFlights = createAsyncThunk(
    "flights/fetchFlights",
    async (search?: string) => {
        const token = localStorage.getItem("token");
        const url = search ? `/api/flights?search=${search}` : "/api/flights";
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to fetch flights");
        }
        return response.json();
    }
);

export const createFlight = createAsyncThunk(
    "flights/createFlight",
    async (data: Partial<Flight>) => {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/flights", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to create flight");
        }
        return response.json();
    }
);

export const updateFlight = createAsyncThunk(
    "flights/updateFlight",
    async (data: { id: number; data: Partial<Flight> }) => {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/flights/${data.id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data.data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to update flight");
        }
        return response.json();
    }
);

const flightSlice = createSlice({
    name: "flights",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchFlights.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchFlights.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.list = action.payload;
            })
            .addCase(fetchFlights.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message || "Failed to fetch flights";
            })
            .addCase(createFlight.fulfilled, (state, action) => {
                state.list.unshift(action.payload);
            })
            .addCase(updateFlight.fulfilled, (state, action) => {
                const index = state.list.findIndex((f) => f.id === action.payload.id);
                if (index !== -1) {
                    state.list[index] = action.payload;
                }
            });
    },
});

export default flightSlice.reducer;
