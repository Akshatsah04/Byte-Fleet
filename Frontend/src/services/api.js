import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://byte-fleet-backend.vercel.app/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach auth token automatically if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global error handling (optional but useful)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // token expired / invalid — could redirect to login here later
      console.warn("Unauthorized request");
    }
    return Promise.reject(error);
  }
);

export default api;