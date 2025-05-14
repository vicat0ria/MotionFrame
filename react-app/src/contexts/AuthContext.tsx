import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";
import api from "@/services/api";
import routes from "@/routes";
import { User, UserPreferences } from "@/types/user";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

// Create a context with undefined initial value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth Provider Component
 * Manages authentication state and provides auth methods to the application
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // First check if backend is available
        const isBackendAvailable = await authService.checkBackendAvailability();
        if (!isBackendAvailable) {
          console.warn("Backend is not available during initialization");
          setIsLoading(false);
          return;
        }

        const userId = await authService.getCurrentUserId();
        if (userId) {
          try {
            // Get user data from backend using configured API instance
            const response = await api.get<User>("/auth/current-user");
            if (response.data) {
              setUser(response.data);
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
            // Clear local data on error
            localStorage.removeItem("userId");
            localStorage.removeItem("exportedProjects");
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        // Clear any stale data
        localStorage.removeItem("userId");
        localStorage.removeItem("exportedProjects");
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Login method
   */
  const login = useCallback(
    async (email: string, password: string) => {
      try {
        setIsLoading(true);
        await authService.login(email, password);
        const userId = await authService.getCurrentUserId();

        if (userId) {
          try {
            // Get user data from backend using configured API instance
            const response = await api.get<User>("/auth/current-user");
            if (response.data) {
              setUser(response.data);

              // Load user's theme preferences
              try {
                const prefsResponse = await api.get<UserPreferences>(
                  `/users/${userId}/preferences`
                );
                if (prefsResponse.data?.theme) {
                  const userTheme = prefsResponse.data.theme;
                  localStorage.setItem(`theme_${userId}`, userTheme);
                  // Trigger storage event for theme provider
                  window.dispatchEvent(new Event("storage"));
                }
              } catch (error) {
                console.error("Error loading user theme preferences:", error);
              }

              navigate(routes.home);
            }
          } catch (error) {
            console.error("Error fetching user data after login:", error);
            throw error;
          }
        }
      } catch (error) {
        console.error("Login error:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [navigate]
  );

  /**
   * Signup method
   */
  const signup = useCallback(
    async (email: string, password: string) => {
      try {
        setIsLoading(true);
        await authService.signup(email, password);
        await login(email, password);
      } catch (error) {
        console.error("Signup error:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [login]
  );

  /**
   * Logout method
   */
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);

      // Reset theme to default dark theme
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add("dark");

      navigate(routes.login);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const updateUser = (userData: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...userData } : null));
  };

  // Context value
  const value = {
    user,
    isLoading,
    login,
    signup,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Auth hook for convenient access to auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
