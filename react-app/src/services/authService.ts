import axios from "axios";
import { API_BASE_URL } from "./api";

const IS_DEV = process.env.NODE_ENV === "development";

interface AuthResponse {
  id: string;
  email: string;
  username?: string;
  profile?: {
    name?: string;
    picture?: string;
    provider?: string;
  };
  isEmailVerified: boolean;
}

interface LoginResponse {
  id: string;
  email: string;
}

interface SignupResponse {
  id: string;
  email: string;
}

class AuthService {
  private static instance: AuthService;
  private currentUserId: string | null = null;
  private isBackendAvailable: boolean = true;

  private constructor() {
    // Initialize from localStorage if available
    const savedUserId = localStorage.getItem("userId");
    if (savedUserId) {
      this.currentUserId = savedUserId;
    }
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async checkBackendAvailability(): Promise<boolean> {
    try {
      await axios.get(`${API_BASE_URL}/health`, {
        timeout: 2000,
        validateStatus: (status) => status === 200,
      });
      this.isBackendAvailable = true;
      return true;
    } catch {
      this.isBackendAvailable = false;
      return false;
    }
  }

  public async login(email: string, password: string): Promise<void> {
    try {
      const response = await axios.post<{
        message: string;
        user: LoginResponse;
      }>(
        `${API_BASE_URL}/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      const userData = response.data.user;
      if (userData && userData.id) {
        this.currentUserId = userData.id;
        localStorage.setItem("userId", userData.id);
      } else {
        throw new Error("Invalid login response");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  public async signup(email: string, password: string): Promise<void> {
    try {
      const response = await axios.post<SignupResponse>(
        `${API_BASE_URL}/auth/signup`,
        { email, password },
        { withCredentials: true }
      );

      if (response.data && response.data.id) {
        this.currentUserId = response.data.id;
        localStorage.setItem("userId", response.data.id);
      } else {
        throw new Error("Invalid signup response");
      }
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  }

  public async getCurrentUserId(): Promise<string> {
    // If we already have a user ID and backend is not available, use the cached one
    if (this.currentUserId && !this.isBackendAvailable) {
      return this.currentUserId;
    }

    try {
      // Check if backend is available
      const isAvailable = await this.checkBackendAvailability();
      if (!isAvailable) {
        if (IS_DEV && this.currentUserId) {
          console.warn("Backend unavailable, using cached user ID");
          return this.currentUserId;
        }
        throw new Error("Backend is not available");
      }

      // Get user ID from backend
      const response = await axios.get<AuthResponse>(
        `${API_BASE_URL}/auth/current-user`,
        {
          withCredentials: true,
        }
      );

      if (response.data && response.data.id) {
        const userId = response.data.id;
        this.currentUserId = userId;
        localStorage.setItem("userId", userId);
        return userId;
      }

      throw new Error("No user ID in response");
    } catch (error) {
      console.error("Error getting user ID:", error);

      // In development, provide a fallback user ID
      if (IS_DEV) {
        console.warn("Using development fallback user ID");
        const devUserId = "dev-user-123";
        this.currentUserId = devUserId;
        localStorage.setItem("userId", devUserId);
        return devUserId;
      }

      // If we have a cached user ID, use it as fallback
      if (this.currentUserId) {
        console.warn("Using cached user ID due to backend unavailability");
        return this.currentUserId;
      }

      throw new Error("Failed to get user ID and no fallback available");
    }
  }

  public async logout(): Promise<void> {
    try {
      // Only attempt backend logout if backend is available
      if (this.isBackendAvailable) {
        await axios.post(
          `${API_BASE_URL}/auth/logout`,
          {},
          {
            withCredentials: true,
          }
        );
      }
    } catch (error) {
      console.error("Error during logout:", error);
      // In development, still clear local state even if backend call fails
      if (IS_DEV) {
        console.warn("Using development fallback logout");
      } else {
        throw error;
      }
    } finally {
      this.currentUserId = null;
      localStorage.removeItem("userId");
      // Don't clear projects on logout
    }
  }
}

export const authService = AuthService.getInstance();
