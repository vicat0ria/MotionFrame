import axios from "axios";

export const API_BASE_URL =
  process.env.VITE_API_URL || "http://localhost:5000/api";
export const FRONTEND_BASE_URL = "http://localhost:5173/MotionFrame/#";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add CSRF token to requests
api.interceptors.request.use((config) => {
  const csrfToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrfToken="))
    ?.split("=")[1];

  if (csrfToken && config.headers) {
    config.headers["X-CSRF-Token"] = csrfToken;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 401 if it's not a auth-related endpoint
    if (error.response?.status === 401) {
      // Get the current path from window.location
      const currentPath = window.location.pathname + window.location.hash;

      // Don't redirect if already on login or signup pages
      if (
        !currentPath.includes("/login") &&
        !currentPath.includes("/signup") &&
        !error.config.url.includes("/auth/current-user")
      ) {
        console.log("Unauthorized access, redirecting to login page");
        // Handle unauthorized access with exact URL
        window.location.href = `${FRONTEND_BASE_URL}/login`;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
