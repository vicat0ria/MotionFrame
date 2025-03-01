import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import routes from "./components/routes";

function App() {
  return (
    <Router basename="/MotionFrame">
      <Routes>
        <Route path={routes.home} element={<h1>Home Page</h1>} />
        <Route path={routes.login} element={<Login />} />
        <Route path={routes.register} element={<Register />} />
        <Route
          path={routes.dashboard}
          element={<h1>Welcome to the Dashboard</h1>}
        />
        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default App;
