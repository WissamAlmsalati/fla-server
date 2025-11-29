import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export interface Announcement {
    id: number;
    title: string;
    imageUrl: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface AnnouncementState {
    list: Announcement[];
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
}

const initialState: AnnouncementState = {
    list: [],
    status: "idle",
    error: null,
};

export const fetchAnnouncements = createAsyncThunk(
    "announcements/fetchAnnouncements",
    async () => {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/announcements", {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to fetch announcements");
        }

        return response.json();
    }
);

export const createAnnouncement = createAsyncThunk(
    "announcements/createAnnouncement",
    async (formData: FormData) => {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/announcements", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to create announcement");
        }

        return response.json();
    }
);

export const updateAnnouncement = createAsyncThunk(
    "announcements/updateAnnouncement",
    async ({ id, formData }: { id: number; formData: FormData }) => {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/announcements/${id}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to update announcement");
        }

        return response.json();
    }
);

export const deleteAnnouncement = createAsyncThunk(
    "announcements/deleteAnnouncement",
    async (id: number) => {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/announcements/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to delete announcement");
        }

        return id;
    }
);

export const toggleAnnouncementStatus = createAsyncThunk(
    "announcements/toggleStatus",
    async (id: number) => {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/announcements/${id}/toggle`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to toggle announcement status");
        }

        return response.json();
    }
);

const announcementSlice = createSlice({
    name: "announcements",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch announcements
            .addCase(fetchAnnouncements.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchAnnouncements.fulfilled, (state, action: PayloadAction<Announcement[]>) => {
                state.status = "succeeded";
                state.list = action.payload;
            })
            .addCase(fetchAnnouncements.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message || "Failed to fetch announcements";
            })
            // Create announcement
            .addCase(createAnnouncement.fulfilled, (state, action: PayloadAction<Announcement>) => {
                state.list.unshift(action.payload);
            })
            // Update announcement
            .addCase(updateAnnouncement.fulfilled, (state, action: PayloadAction<Announcement>) => {
                const index = state.list.findIndex((a) => a.id === action.payload.id);
                if (index !== -1) {
                    state.list[index] = action.payload;
                }
            })
            // Delete announcement
            .addCase(deleteAnnouncement.fulfilled, (state, action: PayloadAction<number>) => {
                state.list = state.list.filter((a) => a.id !== action.payload);
            })
            // Toggle announcement status
            .addCase(toggleAnnouncementStatus.fulfilled, (state, action: PayloadAction<Announcement>) => {
                const index = state.list.findIndex((a) => a.id === action.payload.id);
                if (index !== -1) {
                    state.list[index] = action.payload;
                }
            });
    },
});

export default announcementSlice.reducer;
