import React from "react";
import "./AdminTopbar.css";

const AdminTopbar = () => {
  return (
    <div className="admin-topbar">
      <h2 className="topbar-title">Welcome, Admin</h2>
      <div className="topbar-actions">
        <input type="text" className="topbar-search" placeholder="Search..." />
        <div className="topbar-profile">
          <img src="https://via.placeholder.com/40" alt="Admin" />
        </div>
      </div>
    </div>
  );
};

export default AdminTopbar;
