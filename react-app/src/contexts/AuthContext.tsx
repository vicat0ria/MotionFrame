import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "@/services/auth";
import { useToast } from "@/components/ui/use-toast";
import routes from "@/routes";

interface User {
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

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  getToken: () => Promise<string>;
}

// Create a context with undefined initial value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth Provider Component
 * Manages authentication state and provides auth methods to the application
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Initialize authentication state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Only try to get current user if not on login or signup pages
        const path = location.pathname + location.hash;
        const isAuthPage = path.includes("/login") || path.includes("/signup");

        if (!isAuthPage) {
          try {
            const currentUser = (await auth.getCurrentUser()) as User;
            setUser(currentUser);

            // Check if this is a new user from OAuth
            const params = new URLSearchParams(location.search);
            if (params.get("newUser") === "true") {
              toast({
                title: "Welcome!",
                description: "Your account has been created successfully.",
              });
              // Remove the newUser param from URL and redirect to video editor
              navigate(routes.videoEditor, { replace: true });
            }
          } catch (error) {
            // If authentication fails, clear user but don't redirect
            setUser(null);
            console.error("Authentication error:", error);
          }
        } else {
          // If we're on auth pages, clear the user state
          setUser(null);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [location, navigate, toast]);

  /**
   * Login method
   */
  const login = useCallback(
    async (email: string, password: string) => {
      try {
        setIsLoading(true);
        const response = (await auth.login(email, password)) as { user: User };
        setUser(response.user);
        navigate(routes.videoEditor);
        toast({
          title: "Welcome back!",
          description: "You've successfully logged in.",
        });
      } catch (error) {
        console.error("Login error:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [navigate, toast]
  );

  /**
   * Signup method
   */
  const signup = useCallback(
    async (email: string, password: string, name: string) => {
      try {
        setIsLoading(true);
        await auth.signup({ email, password, name });

        // Auto login after signup
        const response = (await auth.login(email, password)) as { user: User };
        setUser(response.user);
        navigate(routes.videoEditor);

        toast({
          title: "Success",
          description: "Account created successfully! Welcome to MotionFrame.",
        });
      } catch (error) {
        console.error("Signup error:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [navigate, toast]
  );

  /**
   * Logout method
   */
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await auth.logout();
      setUser(null);
      navigate(routes.login);

      toast({
        title: "Logged out",
        description: "You've been successfully logged out.",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [navigate, toast]);

  // Context value
  const value = {
    user,
    login,
    signup,
    logout,
    isLoading,
    getToken: async () => {
      const response = (await auth.refreshToken()) as { token: string };
      return response.token;
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Auth hook for convenient access to auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
