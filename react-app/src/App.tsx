import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import routes from "./components/routes";

function App() {
  return (
    <Router basename="/MotionFrame">
      <Routes>
        <Route path={routes.login} element={<Login />} />
        <Route
          path={routes.dashboard}
          element={<h1>Welcome to the Dashboard</h1>}
        />
      </Routes>
    </Router>
  );
}

export default App;
