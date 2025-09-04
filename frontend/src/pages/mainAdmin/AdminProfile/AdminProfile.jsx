// AdminProfile.jsx (MNC-Level with Change Password)

import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "../AdminLayout/AdminLayout";
import "./AdminProfile.css";

const AdminProfile = () => {
  const [admin, setAdmin] = useState(null);
  const [changeMode, setChangeMode] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchAdmin = async () => {
    const token = localStorage.getItem("adminToken");
    try {
      const res = await axios.get("/api/admin/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdmin(res.data.admin);
    } catch (err) {
      console.error("Failed to fetch admin profile", err);
    }
  };

  useEffect(() => {
    fetchAdmin();
  }, []);

  const handleInput = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = async () => {
    setLoading(true);
    const token = localStorage.getItem("adminToken");
    try {
      const res = await axios.put(
        "/api/admin/change-password",
        passwords,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({ type: "success", text: res.data.message });
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setChangeMode(false);
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to change password" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-profile-page">
        <h2 className="profile-heading">Admin Profile</h2>
        {admin ? (
          <div className="admin-profile-card">
            <p><strong>Name:</strong> {admin.name}</p>
            <p><strong>Email:</strong> {admin.email}</p>
            <p><strong>Role:</strong> Admin</p>
            <p><strong>Created:</strong> {new Date(admin.createdAt).toLocaleString()}</p>

            <button className="change-password-toggle" onClick={() => setChangeMode(!changeMode)}>
              {changeMode ? "Cancel Change" : "Change Password"}
            </button>

            {changeMode && (
              <div className="change-password-box">
                <input
                  type="password"
                  name="currentPassword"
                  value={passwords.currentPassword}
                  onChange={handleInput}
                  placeholder="Current Password"
                  className="profile-input"
                />
                <input
                  type="password"
                  name="newPassword"
                  value={passwords.newPassword}
                  onChange={handleInput}
                  placeholder="New Password"
                  className="profile-input"
                />
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwords.confirmPassword}
                  onChange={handleInput}
                  placeholder="Confirm New Password"
                  className="profile-input"
                />
                <button
                  onClick={handlePasswordChange}
                  className="submit-password-btn"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </div>
            )}

            {message && (
              <div className={`message ${message.type}`}>{message.text}</div>
            )}
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminProfile;
