import axios from "axios";

// Determine base API URL:
// 1. Explicit VITE_API_URL if configured (e.g. cross-origin deployments)
// 2. Relative "/api" in production (e.g. Render / single-origin)
// 3. Fallback to "http://localhost:5000/api" in local development
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (import.meta.env.DEV) {
    return "http://localhost:5000/api";
  }
  return "/api";
};

// Axios instance configured with base API URL
const api = axios.create({
  baseURL: getApiBaseUrl(),
});

// Interceptor to attach the JWT token to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = "Bearer " + token;
  }
  return config;
});

export default api;

