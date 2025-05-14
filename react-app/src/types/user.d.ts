export interface User {
  id: string;
  email: string;
  username?: string;
  profile?: {
    name?: string;
    picture?: string;
    provider?: string;
  };
  isEmailVerified: boolean;
  authProvider: string;
  hasPassword: boolean;
}

export interface UserPreferences {
  theme: "dark" | "light";
  language?: string;
}
