import React from "react";
import { useNavigate } from "react-router-dom";

const SubAdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("subadminToken");
    navigate("/subadmin");
  };

  return (
    <div style={{
      maxWidth: 800,
      margin: "50px auto",
      padding: 30,
      boxShadow: "0 0 10px rgba(0,0,0,0.1)",
      borderRadius: 10,
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <h1 style={{ textAlign: "center", marginBottom: 40 }}>Welcome to SubAdmin Dashboard</h1>
      <p style={{ textAlign: "center", fontSize: 18, marginBottom: 40 }}>
        You are successfully logged in as a SubAdmin.
      </p>
      <div style={{ textAlign: "center" }}>
        <button
          onClick={handleLogout}
          style={{
            padding: "12px 30px",
            backgroundColor: "#d3544b",
            color: "white",
            border: "none",
            borderRadius: 5,
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default SubAdminDashboard;
