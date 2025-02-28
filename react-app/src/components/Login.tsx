import { useState } from "react";
import { useNavigate } from "react-router-dom";
//import routes from "./routes";
import styles from "./Login.module.css"; // Import CSS module

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // To redirect after login

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Logging in with:", email, password);
    
    // Fake authentication check (replace with real API call)
    if (email === "test@example.com" && password === "password123") {
      navigate("/dashboard"); // Redirect after login
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className={styles.container}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
