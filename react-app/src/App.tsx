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

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path={routes.home} element={<HomeRoute />} />
            <Route path={routes.login} element={<Login />} />
            <Route path={routes.signup} element={<SignUp />} />
            <Route
              path={routes.videoEditor}
              element={
                <ProtectedRoute>
                  <VideoEditor />
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
