import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import routes from "./routes";
import VideoEditor from "./pages/VideoEditor";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { ToastProvider } from "@/components/ui/toast";
import Export from "./pages/Export";
import { useEffect } from "react";

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to={routes.login} replace />;
  }

  return <>{children}</>;
};

// Home route that redirects based on authentication status
const HomeRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return user ? (
    <Navigate to={routes.videoEditor} replace />
  ) : (
    <Navigate to={routes.login} replace />
  );
};

function LoginWithBypass() {
  useEffect(() => {
    // If already logged in, redirect
    if (localStorage.getItem("fakeUser")) {
      window.location.href = "#/export";
    }
  }, []);
  return (
    <div>
      <Login />
      <button
        style={{
          marginTop: 24,
          padding: "12px 24px",
          background: "#4CAF50",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          fontSize: 18,
          cursor: "pointer",
          display: "block"
        }}
        onClick={() => {
          localStorage.setItem("fakeUser", JSON.stringify({ name: "dev" }));
          window.location.reload();
        }}
      >
        Bypass Login (Dev Only)
      </button>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path={routes.home} element={<HomeRoute />} />
            <Route path={routes.login} element={<LoginWithBypass />} />
            <Route path={routes.signup} element={<SignUp />} />
            <Route
              path={routes.videoEditor}
              element={
                <ProtectedRoute>
                  <VideoEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path={routes.export}
              element={
                <ProtectedRoute>
                  <Export />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to={routes.login} replace />} />
          </Routes>
          <Toaster />
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
