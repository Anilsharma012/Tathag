import React, { useState } from "react";
import axios from "../../../utils/axiosConfig";
import "./SubAdminLogin.css";
import { API_BASE } from "../../../utils/apiBase";

const BASE_URL = API_BASE;

const SubAdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    console.log("API URL:", BASE_URL); // Debug ke liye

    try {
      // REACT_APP_BACKEND_URL me /api/v1 hai — isko replace kar do /api se
      const fixedURL = BASE_URL.replace("/api/v1", "/api");

      const res = await axios.post(`${fixedURL}/subadmin/login`, {
        email,
        password,
      });

      localStorage.setItem("subadminToken", res.data.token);
      window.location.href = "/subadmin/dashboard";
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="subadmin-login__container">
      <div className="subadmin-login__left">
        Welcome to <br /> SubAdmin Panel
      </div>
      <div className="subadmin-login__right">
        <form className="subadmin-login__form" onSubmit={handleSubmit}>
          <h2>SubAdmin Login</h2>
          <input
            type="email"
            placeholder="Email"
            required
            className="subadmin-login__input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            required
            className="subadmin-login__input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="subadmin-login__button">
            Login
          </button>
          {error && <p className="subadmin-login__error">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default SubAdminLogin;
