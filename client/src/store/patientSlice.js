import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { patientAPI } from "../utils/api";

const initialState = {
  searchResults: [],
  selectedPatient: null,
  loading: false,
  error: null,
};

export const searchPatients = createAsyncThunk(
  "patient/searchPatients",
  async (query, { rejectWithValue }) => {
    try {
      const response = await patientAPI.search(query);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to search patients",
      );
    }
  },
);

export const createPatient = createAsyncThunk(
  "patient/createPatient",
  async (patientData, { rejectWithValue }) => {
    try {
      const response = await patientAPI.create(patientData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.details?.[0]?.message ||
          error.response?.data?.message ||
          "Failed to create patient",
      );
    }
  },
);

const patientSlice = createSlice({
  name: "patient",
  initialState,
  reducers: {
    selectPatient: (state, action) => {
      state.selectedPatient = action.payload;
    },
    clearSearch: (state) => {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Search patients
      .addCase(searchPatients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchPatients.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchPatients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create patient
      .addCase(createPatient.fulfilled, (state, action) => {
        state.selectedPatient = action.payload;
      });
  },
});

export const { selectPatient, clearSearch } = patientSlice.actions;
export default patientSlice.reducer;
