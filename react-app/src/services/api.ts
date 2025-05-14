import axios from "axios";

// Get API URL from environment variable or use default
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export const FRONTEND_BASE_URL = "http://localhost:5173/MotionFrame/#";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for error handling
api.interceptors.request.use(
  (config) => {
    // Add CSRF token if available
    const csrfToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrfToken="))
      ?.split("=")[1];

    if (csrfToken && config.headers) {
      config.headers["X-CSRF-Token"] = csrfToken;
    }
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Response error:", error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Request setup error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
