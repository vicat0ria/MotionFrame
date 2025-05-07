import api, { API_BASE_URL } from "./api";

export const auth = {
  login: async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  signup: async (userData: {
    email: string;
    password: string;
    name: string;
    username?: string;
  }) => {
    // If username is not provided, create one from the name
    if (!userData.username) {
      // Convert name to lowercase, replace spaces with underscores
      const generatedUsername = userData.name
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_-]/g, ""); // Remove any characters that aren't allowed

      userData.username = generatedUsername;
    }

    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get("/auth/current-user");
    return response.data;
  },

  refreshToken: async () => {
    const response = await api.post("/auth/refresh-token");
    return response.data;
  },

  // OAuth methods
  loginWithGoogle: () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  },

  loginWithFacebook: () => {
    window.location.href = `${API_BASE_URL}/auth/facebook`;
  },

  loginWithLinkedIn: () => {
    window.location.href = `${API_BASE_URL}/auth/linkedin`;
  },

  loginWithGitHub: () => {
    window.location.href = `${API_BASE_URL}/auth/github`;
  },
};
