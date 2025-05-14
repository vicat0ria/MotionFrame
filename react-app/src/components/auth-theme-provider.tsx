import { createContext, useEffect } from "react";

type AuthThemeProviderProps = {
  children: React.ReactNode;
};

const AuthThemeProviderContext = createContext<null>(null);

export function AuthThemeProvider({ children }: AuthThemeProviderProps) {
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add("dark");
  }, []);

  return (
    <AuthThemeProviderContext.Provider value={null}>
      {children}
    </AuthThemeProviderContext.Provider>
  );
}
