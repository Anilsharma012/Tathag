import React, { useState } from "react";
import axios from "../../utils/axiosConfig";
import "./AdminLogin.css";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    console.log("Attempting admin login with URL:", "/api/admin/login");

    try {
      const res = await axios.post("/api/admin/login", {
        email,
        password,
      });

      if (res.data && res.data.token) {
        localStorage.setItem("adminToken", res.data.token);
        console.log("Admin login successful, redirecting...");
        window.location.href = "/admin/dashboard";
      } else {
        throw new Error("No token received from server");
      }
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage = err.response?.data?.message || err.message || "Login failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login__container">
      <div className="admin-login__left">
        Welcome to <br /> Admin Panel
      </div>
      <div className="admin-login__right">
        <form className="admin-login__form" onSubmit={handleSubmit}>
          <h2>Admin Login</h2>
          <input
            type="email"
            placeholder="Email"
            required
            className="admin-login__input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            required
            className="admin-login__input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="admin-login__button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
          {error && <p className="admin-login__error">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
