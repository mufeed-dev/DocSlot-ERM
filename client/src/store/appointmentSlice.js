import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { appointmentAPI } from "../utils/api";

const initialState = {
  appointments: [],
  currentAppointment: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12,
  },
  loading: false,
  error: null,
};

export const fetchAppointments = createAsyncThunk(
  "appointment/fetchAppointments",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await appointmentAPI.getAll(params);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch appointments",
      );
    }
  },
);

export const bookAppointment = createAsyncThunk(
  "appointment/bookAppointment",
  async (appointmentData, { rejectWithValue }) => {
    try {
      const response = await appointmentAPI.create(appointmentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.details?.[0]?.message ||
          error.response?.data?.message ||
          "Booking failed",
      );
    }
  },
);

export const updateAppointment = createAsyncThunk(
  "appointment/updateAppointment",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await appointmentAPI.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.details?.[0]?.message ||
          error.response?.data?.message ||
          "Failed to update appointment",
      );
    }
  },
);

export const cancelAppointment = createAsyncThunk(
  "appointment/cancelAppointment",
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await appointmentAPI.cancel(id, reason);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to cancel appointment",
      );
    }
  },
);

export const markArrived = createAsyncThunk(
  "appointment/markArrived",
  async (id, { rejectWithValue }) => {
    try {
      const response = await appointmentAPI.arrive(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to mark patient as arrived",
      );
    }
  },
);

const appointmentSlice = createSlice({
  name: "appointment",
  initialState,
  reducers: {
    clearCurrentAppointment: (state) => {
      state.currentAppointment = null;
    },
    socketAppointmentCreated: (state, action) => {
      state.appointments.unshift(action.payload);
      state.pagination.totalItems += 1;
    },
    socketAppointmentUpdated: (state, action) => {
      const index = state.appointments.findIndex(
        (app) => app._id === action.payload._id,
      );
      if (index !== -1) {
        state.appointments[index] = action.payload;
      }
      if (state.currentAppointment?._id === action.payload._id) {
        state.currentAppointment = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch appointments
      .addCase(fetchAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Book appointment
      .addCase(bookAppointment.fulfilled, (state, action) => {
        const exists = state.appointments.some(
          (app) => app._id === action.payload._id,
        );
        if (!exists) {
          state.appointments.unshift(action.payload);
          state.pagination.totalItems += 1;
        }
      })
      // Update appointment
      .addCase(updateAppointment.fulfilled, (state, action) => {
        const index = state.appointments.findIndex(
          (app) => app._id === action.payload._id,
        );
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
      })
      // Cancel appointment
      .addCase(cancelAppointment.fulfilled, (state, action) => {
        const index = state.appointments.findIndex(
          (app) => app._id === action.payload._id,
        );
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
      })
      // Mark arrived
      .addCase(markArrived.fulfilled, (state, action) => {
        const index = state.appointments.findIndex(
          (app) => app._id === action.payload._id,
        );
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
      });
  },
});

export const {
  clearCurrentAppointment,
  socketAppointmentCreated,
  socketAppointmentUpdated,
} = appointmentSlice.actions;

export default appointmentSlice.reducer;
