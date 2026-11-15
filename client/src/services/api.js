import axios from "axios";
import config from "../config/env";

// Axios instance configured with central runtime base API URL
const api = axios.create({
  baseURL: config.apiBaseUrl,
});

// Interceptor to attach the JWT token to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = "Bearer " + token;
  }
  return config;
});

// Interceptor to handle global response errors and expired sessions
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 Unauthorized handling (token expired or invalidated)
    if (error.response?.status === 401) {
      const isLoginRequest = error.config?.url?.includes("/auth/login");
      if (!isLoginRequest) {
        localStorage.removeItem("token");
      }
    }

    // Attach human-readable message
    if (!error.response) {
      error.userMessage = "Network error: Unable to reach the campus server. Please check your connection.";
    } else {
      error.userMessage = error.response.data?.message || "An unexpected error occurred. Please try again.";
    }

    return Promise.reject(error);
  }
);

export default api;

