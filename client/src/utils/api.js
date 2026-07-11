import axios from "axios";
import { config } from "../config/config";

const api = axios.create({
  baseURL: config.API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
  withCredentials: true,
});

// Interceptor to handle expired tokens and server errors
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle Server Errors
    if (!error.response || error.response.status >= 500) {
      window.location.href = "/server-error";
      return Promise.reject(error);
    }

    // Handle Unauthorized Access (401 Expired Token)
    if (
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/login") &&
      !originalRequest.url.includes("/auth/refresh")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Send refresh POST request, server cookie is sent and set automatically
        await api.post("/auth/refresh");

        processQueue(null);
        isRefreshing = false;

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        isRefreshing = false;

        localStorage.removeItem(config.AUTH_CONFIG.userKey);
        window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export const authAPI = {
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },
  refresh: async () => {
    const response = await api.post("/auth/refresh");
    return response.data;
  },
  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },
};

export const userAPI = {
  create: async (userData) => {
    const response = await api.post("/users", userData);
    return response.data;
  },
  getUsers: async (params = {}) => {
    const response = await api.get("/users", { params });
    return response.data;
  },
};

export const doctorAPI = {
  getAll: async (params = {}) => {
    const response = await api.get("/doctors", { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/doctors/${id}`);
    return response.data;
  },
  create: async (doctorData) => {
    const response = await api.post("/doctors", doctorData);
    return response.data;
  },
};

export const scheduleAPI = {
  createOrUpdate: async (scheduleData) => {
    const response = await api.post("/schedules", scheduleData);
    return response.data;
  },
  getByDoctor: async (doctorId) => {
    const response = await api.get(`/schedules/doctor/${doctorId}`);
    return response.data;
  },
};

export const slotAPI = {
  getSlots: async (doctorId, date) => {
    const response = await api.get("/slots", { params: { doctorId, date } });
    return response.data;
  },
};

export const patientAPI = {
  create: async (patientData) => {
    const response = await api.post("/patients", patientData);
    return response.data;
  },
  search: async (query) => {
    const response = await api.get("/patients/search", { params: { query } });
    return response.data;
  },
};

export const appointmentAPI = {
  create: async (appointmentData) => {
    const response = await api.post("/appointments", appointmentData);
    return response.data;
  },
  getAll: async (params = {}) => {
    const response = await api.get("/appointments", { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },
  update: async (id, appointmentData) => {
    const response = await api.put(`/appointments/${id}`, appointmentData);
    return response.data;
  },
  cancel: async (id, reason) => {
    const response = await api.delete(`/appointments/${id}`, {
      data: { reason },
    });
    return response.data;
  },
  arrive: async (id) => {
    const response = await api.post(`/appointments/${id}/arrive`);
    return response.data;
  },
};

export const auditAPI = {
  getLogs: async (params = {}) => {
    const response = await api.get("/audit", { params });
    return response.data;
  },
};

export default api;
