import React from "react";
import AdminLayout from "./AdminLayout/AdminLayout";
import "./AdminDashboard.css";
import { FaUsers, FaBookOpen, FaChalkboardTeacher, FaUserGraduate } from "react-icons/fa";

const AdminDashboard = () => {
  return (
    <AdminLayout>
      <div className="dashboard-container">
        <h1 className="dashboard-title">Admin Dashboard</h1>
        <div className="dashboard-widgets">
          <div className="dashboard-card">
            <FaUsers className="dashboard-icon" />
            <div>
              <h2>1,200+</h2>
              <p>Total Users</p>
            </div>
          </div>
          <div className="dashboard-card">
            <FaBookOpen className="dashboard-icon" />
            <div>
              <h2>250+</h2>
              <p>Live Courses</p>
            </div>
          </div>
          <div className="dashboard-card">
            <FaChalkboardTeacher className="dashboard-icon" />
            <div>
              <h2>60+</h2>
              <p>Teachers</p>
            </div>
          </div>
          <div className="dashboard-card">
            <FaUserGraduate className="dashboard-icon" />
            <div>
              <h2>900+</h2>
              <p>Students</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
