import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { doctorAPI, scheduleAPI, slotAPI } from "../utils/api";

const initialState = {
  doctors: [],
  selectedDoctor: null,
  activeSchedule: null,
  activeSlots: [],
  loading: false,
  slotsLoading: false,
  error: null,
};

export const fetchDoctors = createAsyncThunk(
  "doctor/fetchDoctors",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await doctorAPI.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch doctors",
      );
    }
  },
);

export const createDoctor = createAsyncThunk(
  "doctor/createDoctor",
  async (doctorData, { rejectWithValue }) => {
    try {
      const response = await doctorAPI.create(doctorData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.details?.[0]?.message ||
          error.response?.data?.message ||
          "Failed to create doctor",
      );
    }
  },
);

export const configureSchedule = createAsyncThunk(
  "doctor/configureSchedule",
  async (scheduleData, { rejectWithValue }) => {
    try {
      const response = await scheduleAPI.createOrUpdate(scheduleData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.details?.[0]?.message ||
          error.response?.data?.message ||
          "Failed to configure doctor schedule",
      );
    }
  },
);

export const fetchSchedule = createAsyncThunk(
  "doctor/fetchSchedule",
  async (doctorId, { rejectWithValue }) => {
    try {
      const response = await scheduleAPI.getByDoctor(doctorId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch doctor schedule",
      );
    }
  },
);

export const fetchSlots = createAsyncThunk(
  "doctor/fetchSlots",
  async ({ doctorId, date }, { rejectWithValue }) => {
    try {
      const response = await slotAPI.getSlots(doctorId, date);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch slots",
      );
    }
  },
);

const doctorSlice = createSlice({
  name: "doctor",
  initialState,
  reducers: {
    clearActiveSlots: (state) => {
      state.activeSlots = [];
    },
    selectDoctor: (state, action) => {
      state.selectedDoctor = action.payload;
      state.activeSchedule = null;
      state.activeSlots = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch doctors
      .addCase(fetchDoctors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.doctors = action.payload;
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create doctor
      .addCase(createDoctor.fulfilled, (state, action) => {
        state.doctors.unshift(action.payload);
      })
      // Fetch schedule
      .addCase(fetchSchedule.fulfilled, (state, action) => {
        state.activeSchedule = action.payload;
      })
      // Configure schedule
      .addCase(configureSchedule.fulfilled, (state, action) => {
        state.activeSchedule = action.payload;
      })
      // Fetch slots
      .addCase(fetchSlots.pending, (state) => {
        state.slotsLoading = true;
        state.error = null;
      })
      .addCase(fetchSlots.fulfilled, (state, action) => {
        state.slotsLoading = false;
        state.activeSlots = action.payload;
      })
      .addCase(fetchSlots.rejected, (state, action) => {
        state.slotsLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearActiveSlots, selectDoctor } = doctorSlice.actions;
export default doctorSlice.reducer;
