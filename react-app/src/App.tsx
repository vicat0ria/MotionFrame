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
import Home from "./pages/Home";
import Settings from "./pages/Settings";
import Export from "./pages/Export";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { ToastProvider } from "@/components/ui/toast";
import "./pages/light.css";

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

// Protected Routes with Theme
const ProtectedRoutes = () => {
  return (
    <Routes>
      <Route
        path={routes.home}
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
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
      <Route
        path={routes.settings}
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Auth routes - outside of ThemeProvider */}
            <Route path={routes.login} element={<Login />} />
            <Route path={routes.signup} element={<SignUp />} />

            {/* Protected routes with theme */}
            <Route path="/*" element={<ProtectedRoutes />} />
          </Routes>
          <Toaster />
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}
