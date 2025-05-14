import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  User,
  Lock,
  Bell,
  Settings as SettingsIcon,
  LogOut,
} from "lucide-react";
import logo from "@/assets/MF-logo.png";
import "./Settings.css";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import routes from "../routes";
import api from "@/services/api";
import { useTheme } from "@/components/theme-provider";

type SettingsTab = "account" | "password" | "notifications" | "preferences";
type Theme = "dark" | "light";
type Language = "en" | "es" | "fr";

const API_URL = "http://localhost:5000";

export default function Settings() {
  const { theme: currentTheme, setTheme: setGlobalTheme } = useTheme();
  const { logout, user, updateUser } = useAuth();
  const showEmailField = user!.authProvider === "email" || user!.hasPassword;
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");
  // Demo user state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("user@email.com");
  const [editingEmail, setEditingEmail] = useState(false);
  const [tempEmail, setTempEmail] = useState(email);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Preferences state
  const [theme, setTheme] = useState<Theme>(
    currentTheme === "system" ? "dark" : (currentTheme as Theme)
  );
  const [language, setLanguage] = useState<Language>("en");
  const [isSaving, setIsSaving] = useState(false);
  const [isProfileSaving, setIsProfileSaving] = useState(false);

  const navigate = useNavigate();

  // Load saved preferences on component mount
  useEffect(() => {
    const loadPreferences = async () => {
      if (user) {
        try {
          const response = await fetch(
            `${API_URL}/api/users/${user.id}/preferences`,
            {
              credentials: "include",
            }
          );
          if (response.ok) {
            const data = await response.json();
            if (data.theme) {
              setTheme(data.theme);
              // Update HTML class to reflect theme
              document.documentElement.classList.remove("light", "dark");
              document.documentElement.classList.add(data.theme);
            }
            if (data.language) setLanguage(data.language);
          }
        } catch (error) {
          console.error("Error loading preferences:", error);
          const savedTheme = localStorage.getItem(`theme_${user.id}`) as Theme;
          const savedLanguage = localStorage.getItem(
            `language_${user.id}`
          ) as Language;
          if (savedTheme) {
            setTheme(savedTheme);
            // Update HTML class to reflect saved theme
            document.documentElement.classList.remove("light", "dark");
            document.documentElement.classList.add(savedTheme);
          }
          if (savedLanguage) setLanguage(savedLanguage);
        }
      }
    };

    loadPreferences();
  }, [user]);

  // Populate form fields from authenticated user
  useEffect(() => {
    if (user) {
      const fullName = user.profile?.name || "";
      const [first, ...rest] = fullName.split(" ");
      setFirstName(first);
      setLastName(rest.join(" "));
      setEmail(user.email);
    }
  }, [user]);

  const handleEmailEdit = () => {
    setTempEmail(email);
    setEditingEmail(true);
  };
  const handleEmailCancel = () => {
    setTempEmail(email);
    setEditingEmail(false);
  };
  const handleSaveChanges = async () => {
    try {
      setIsProfileSaving(true);
      if (user) {
        const fullName = `${firstName} ${lastName}`.trim();
        const response = await api.put<{
          message: string;
          user: {
            email: string;
            profile?: { name?: string; picture?: string; provider?: string };
          };
        }>("/users/profile", { email, name: fullName });
        const updatedUser = response.data.user;
        updateUser({ email: updatedUser.email, profile: updatedUser.profile });
        toast({ title: "Profile updated", description: response.data.message });
        setEditingEmail(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
      });
    } finally {
      setIsProfileSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handlePasswordUpdate = () => {
    // Add password update logic here
    console.log("Updating password...");
    // Reset password fields after update
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleSavePreferences = async () => {
    try {
      setIsSaving(true);

      if (user) {
        const response = await fetch(
          `${API_URL}/api/users/${user.id}/preferences`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ theme, language }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to save preferences");
        }

        // Update the global theme using the ThemeProvider
        setGlobalTheme(theme);

        toast({
          title: "Preferences saved",
          description: "Your preferences have been updated successfully.",
        });
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getThemeStyles = () => {
    return {
      container: {
        backgroundColor: theme === "dark" ? "#2c223e" : "#ffffff",
        color: theme === "dark" ? "#ffffff" : "#000000",
      },
      sidebar: {
        backgroundColor: theme === "dark" ? "#20192d" : "#f5f5f5",
        borderColor: theme === "dark" ? "#3a3a3a" : "#e0e0e0",
      },
      content: {
        backgroundColor: theme === "dark" ? "#20192d" : "#ffffff",
        borderColor:
          theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
      },
      text: {
        color:
          theme === "dark" ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
      },
      button: {
        backgroundColor:
          theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
        hoverBackground:
          theme === "dark" ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.1)",
      },
      input: {
        backgroundColor: theme === "dark" ? "#000000" : "#ffffff",
        color: theme === "dark" ? "#ffffff" : "#000000",
        borderColor:
          theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
      },
      saveButton: {
        backgroundColor: theme === "dark" ? "#000000" : "#ffffff",
        color: theme === "dark" ? "#ffffff" : "#000000",
        borderColor:
          theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
      },
      editButton: {
        backgroundColor: theme === "dark" ? "#000000" : "#ffffff",
        color: theme === "dark" ? "#ffffff" : "#000000",
        borderColor:
          theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
      },
    };
  };

  const styles = getThemeStyles();

  const handleLogoClick = () => {
    navigate(routes.home);
  };

  const renderContent = () => {
    const styles = getThemeStyles();

    switch (activeTab) {
      case "account":
        return (
          <div
            className="space-y-6 text-left p-8 rounded-xl mt-2 border shadow-lg"
            style={styles.content}
          >
            <h2
              className={`text-2xl font-bold mb-6 text-left ${
                theme === "dark" ? "text-white" : "text-black"
              }`}
            >
              Account
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  className={`block mb-2 ${
                    theme === "dark" ? "text-white/70" : "text-black/70"
                  }`}
                >
                  First Name
                </label>
                <Input
                  type="text"
                  placeholder="Enter your first name"
                  className="w-full"
                  style={styles.input}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div>
                <label
                  className={`block mb-2 ${
                    theme === "dark" ? "text-white/70" : "text-black/70"
                  }`}
                >
                  Last Name
                </label>
                <Input
                  type="text"
                  placeholder="Enter your last name"
                  className="w-full"
                  style={styles.input}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              {showEmailField && (
                <div>
                  <label
                    className={`block mb-2 ${
                      theme === "dark" ? "text-white/70" : "text-black/70"
                    }`}
                  >
                    Email Address
                  </label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="email"
                      className="w-full"
                      style={styles.input}
                      value={editingEmail ? tempEmail : email}
                      onChange={(e) => setTempEmail(e.target.value)}
                      disabled={!editingEmail}
                    />
                    {!editingEmail ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 px-4"
                        style={styles.editButton}
                        onClick={handleEmailEdit}
                      >
                        Edit
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 px-4"
                        style={styles.editButton}
                        onClick={handleEmailCancel}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              )}
              <Button
                onClick={handleSaveChanges}
                disabled={isProfileSaving}
                variant="outline"
                className="w-full text-lg font-semibold rounded-lg py-3 mt-6"
                style={styles.saveButton}
              >
                {isProfileSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        );
      case "password":
        return (
          <div
            className="space-y-6 text-left p-8 rounded-xl mt-2 border shadow-lg"
            style={styles.content}
          >
            <h2
              className={`text-2xl font-bold mb-6 text-left ${
                theme === "dark" ? "text-white" : "text-black"
              }`}
            >
              Password
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  className={`block mb-2 ${
                    theme === "dark" ? "text-white/70" : "text-black/70"
                  }`}
                >
                  Current Password
                </label>
                <Input
                  type="password"
                  placeholder="Enter current password"
                  className="w-full"
                  style={styles.input}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div>
                <label
                  className={`block mb-2 ${
                    theme === "dark" ? "text-white/70" : "text-black/70"
                  }`}
                >
                  New Password
                </label>
                <Input
                  type="password"
                  placeholder="Enter new password"
                  className="w-full"
                  style={styles.input}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div>
                <label
                  className={`block mb-2 ${
                    theme === "dark" ? "text-white/70" : "text-black/70"
                  }`}
                >
                  Confirm New Password
                </label>
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  className="w-full"
                  style={styles.input}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button
                onClick={handlePasswordUpdate}
                className={`w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-semibold rounded-lg py-3 mt-6 ${
                  theme === "dark" ? "bg-white/10" : "bg-black/10"
                }`}
              >
                Update Password
              </Button>
            </div>
          </div>
        );
      case "notifications":
        return (
          <div
            className="space-y-6 text-left p-8 rounded-xl mt-2 border shadow-lg"
            style={styles.content}
          >
            <h2
              className={`text-2xl font-bold mb-6 text-left ${
                theme === "dark" ? "text-white" : "text-black"
              }`}
            >
              Notifications
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Checkbox className="bg-background" />
                <label
                  className={`font-bold ${
                    theme === "dark" ? "text-white/70" : "text-black/70"
                  }`}
                >
                  Receive updates about projects
                </label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox className="bg-background" />
                <label
                  className={`font-bold ${
                    theme === "dark" ? "text-white/70" : "text-black/70"
                  }`}
                >
                  Receive new feature announcements
                </label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox className="bg-background" />
                <label
                  className={`font-bold ${
                    theme === "dark" ? "text-white/70" : "text-black/70"
                  }`}
                >
                  Receive promotions and tips
                </label>
              </div>
              <Button
                className={`w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-semibold rounded-lg py-3 mt-6 ${
                  theme === "dark" ? "bg-white/10" : "bg-black/10"
                }`}
              >
                Save Preferences
              </Button>
            </div>
          </div>
        );
      case "preferences":
        return (
          <div
            className="space-y-6 text-left p-8 rounded-xl mt-2 border shadow-lg"
            style={styles.content}
          >
            <h2
              className={`text-2xl font-bold mb-6 text-left ${
                theme === "dark" ? "text-white" : "text-black"
              }`}
            >
              Preferences
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  className={`block mb-2 ${
                    theme === "dark" ? "text-white/70" : "text-black/70"
                  }`}
                >
                  Theme
                </label>
                <select
                  className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-ring"
                  style={{
                    ...styles.input,
                    backgroundColor: theme === "dark" ? "#000000" : "#ffffff",
                    color: theme === "dark" ? "#ffffff" : "#000000",
                  }}
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as Theme)}
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </div>
              <div>
                <label
                  className={`block mb-2 ${
                    theme === "dark" ? "text-white/70" : "text-black/70"
                  }`}
                >
                  Language
                </label>
                <select
                  className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-ring"
                  style={{
                    ...styles.input,
                    backgroundColor: theme === "dark" ? "#000000" : "#ffffff",
                    color: theme === "dark" ? "#ffffff" : "#000000",
                  }}
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </select>
              </div>
              <Button
                onClick={handleSavePreferences}
                disabled={isSaving}
                className="w-full text-lg font-semibold rounded-lg py-3 mt-6"
                style={styles.saveButton}
              >
                {isSaving ? "Saving..." : "Save Preferences"}
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen" style={styles.container}>
      {/* Sidebar */}
      <aside
        className="w-64 flex flex-col items-center py-8 px-4 border-r"
        style={styles.sidebar}
      >
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-2 mb-10 hover:opacity-80 transition-opacity"
        >
          <div
            className={`pl-3 pr-1 py-3 rounded-xl backdrop-blur-sm ${
              theme === "dark" ? "bg-white/5" : "bg-black/5"
            }`}
          >
            <img
              src={logo}
              alt="MotionFrame Logo"
              className={`h-10 w-auto ${
                theme === "dark" ? "filter invert opacity-90" : "opacity-90"
              }`}
            />
          </div>
          <span
            className={`text-2xl font-bold tracking-tight ${
              theme === "dark" ? "text-white/90" : "text-black/90"
            }`}
          >
            MotionFrame
          </span>
        </button>

        <nav className="w-full space-y-2">
          <button
            onClick={() => setActiveTab("account")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === "account"
                ? styles.button.backgroundColor
                : styles.button.hoverBackground
            }`}
          >
            <User
              className={theme === "dark" ? "text-white" : "text-black"}
              size={20}
            />
            <span className={theme === "dark" ? "text-white" : "text-black"}>
              Account
            </span>
          </button>

          <button
            onClick={() => setActiveTab("password")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === "password"
                ? styles.button.backgroundColor
                : styles.button.hoverBackground
            }`}
          >
            <Lock
              className={theme === "dark" ? "text-white" : "text-black"}
              size={20}
            />
            <span className={theme === "dark" ? "text-white" : "text-black"}>
              Password
            </span>
          </button>

          <button
            onClick={() => setActiveTab("notifications")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === "notifications"
                ? styles.button.backgroundColor
                : styles.button.hoverBackground
            }`}
          >
            <Bell
              className={theme === "dark" ? "text-white" : "text-black"}
              size={20}
            />
            <span className={theme === "dark" ? "text-white" : "text-black"}>
              Notifications
            </span>
          </button>

          <button
            onClick={() => setActiveTab("preferences")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === "preferences"
                ? styles.button.backgroundColor
                : styles.button.hoverBackground
            }`}
          >
            <SettingsIcon
              className={theme === "dark" ? "text-white" : "text-black"}
              size={20}
            />
            <span className={theme === "dark" ? "text-white" : "text-black"}>
              Preferences
            </span>
          </button>

          <div className="border-t border-white/10 my-4" />

          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${styles.button.hoverBackground}`}
          >
            <LogOut
              className={theme === "dark" ? "text-white" : "text-black"}
              size={20}
            />
            <span className={theme === "dark" ? "text-white" : "text-black"}>
              Log Out
            </span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">
        <h1
          className={`text-4xl font-bold tracking-tight mb-8 ${
            theme === "dark" ? "text-white/90" : "text-black/90"
          }`}
        >
          Profile Settings
        </h1>
        <div className="rounded-xl p-0 shadow-none max-w-3xl ml-0">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
