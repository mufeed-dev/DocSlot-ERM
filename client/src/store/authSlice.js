import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { config } from "../config/config";
import { authAPI } from "../utils/api";

const setUserToStorage = (userData) => {
  if (userData) {
    localStorage.setItem(config.AUTH_CONFIG.userKey, JSON.stringify(userData));
  } else {
    localStorage.removeItem(config.AUTH_CONFIG.userKey);
  }
};

const getUserFromStorage = () => {
  const userData = localStorage.getItem(config.AUTH_CONFIG.userKey);
  return userData ? JSON.parse(userData) : null;
};

const initialState = {
  user: getUserFromStorage(),
  isAuthenticated: !!getUserFromStorage(),
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      const user = response.data.user;
      setUserToStorage(user);
      return user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.details?.[0]?.message ||
          error.response?.data?.message ||
          "Login failed",
      );
    }
  },
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logout();
    } catch (error) {
    } finally {
      setUserToStorage(null);
    }
    return null;
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
