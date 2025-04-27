import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import routes from "./components/routes";
import VideoEditor from "./pages/VideoEditor";
import Home from "./pages/Home";

function App() {
  return (
    <Router basename="/MotionFrame">
      <Routes>
        <Route path={routes.home} element={<Navigate to={routes.homePage} replace />} />
        <Route path={routes.homePage} element={<Home />} />
        <Route path={routes.login} element={<Login />} />
        <Route path={routes.signup} element={<SignUp />} />
        <Route
          path={routes.dashboard}
          element={<h1>Welcome to the Dashboard</h1>}
        />
        <Route
          path={routes.videoEditor}
          element={<VideoEditor />}
        />
      </Routes>
    </Router>
  );
}

export default App;
