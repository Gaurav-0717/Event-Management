import axios from "axios";
import { getToken } from "../utils/tokenStorage";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",

  headers: {
    "Content-Type": "application/json",
  },

  timeout: 15000,
});

// ============================================================
// REQUEST INTERCEPTOR
// Always attach the latest JWT before making a protected request.
// ============================================================

api.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ============================================================
// RESPONSE INTERCEPTOR
// Convert Axios errors into the project's standard error shape.
// ============================================================

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = {
      message:
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Network request failed",

      status: error.response?.status,

      data: error.response?.data,
    };

    return Promise.reject(customError);
  },
);

export default api;
