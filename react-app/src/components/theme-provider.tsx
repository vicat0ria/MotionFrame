import { createContext, useContext, useEffect, useState } from "react";
import api from "@/services/api";
import { Theme, ThemeProviderProps, ThemeProviderState } from "@/types/theme";
import { User, UserPreferences } from "@/types/user";

const initialState: ThemeProviderState = {
  theme: "dark",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    // First try to get user-specific theme from localStorage
    const userId = localStorage.getItem("userId");
    if (userId) {
      const userTheme = localStorage.getItem(`theme_${userId}`);
      if (userTheme) return userTheme as Theme;
    }
    return defaultTheme;
  });

  // Load theme from backend when component mounts
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const userResponse = await api.get<User>("/auth/current-user");
        const userId = userResponse.data?.id;
        if (userId) {
          const response = await api.get<UserPreferences>(
            `/users/${userId}/preferences`
          );
          if (response.data?.theme) {
            setTheme(response.data.theme);
            // Update localStorage for quick access
            localStorage.setItem(`theme_${userId}`, response.data.theme);
          }
        }
      } catch (error) {
        console.error("Error loading theme from backend:", error);
      }
    };

    loadTheme();
  }, []);

  // Watch for storage events (e.g., theme changes in other tabs)
  useEffect(() => {
    const handleStorageChange = () => {
      const userId = localStorage.getItem("userId");
      if (userId) {
        const userTheme = localStorage.getItem(`theme_${userId}`) as Theme;
        if (userTheme) {
          setTheme(userTheme);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme: async (newTheme: Theme) => {
      try {
        // Update localStorage immediately for quick access
        const userId = localStorage.getItem("userId");
        if (userId) {
          localStorage.setItem(`theme_${userId}`, newTheme);
        }

        // Update UI state
        setTheme(newTheme);

        // Save to backend for persistence
        const userResponse = await api.get<User>("/auth/current-user");
        if (userResponse.data?.id) {
          await api.put(`/users/${userResponse.data.id}/preferences`, {
            theme: newTheme,
          });
        }
      } catch (error) {
        console.error("Error saving theme to backend:", error);
      }
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
