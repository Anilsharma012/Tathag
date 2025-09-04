import React from "react";
import AdminSidebar from "../AdminSidebar/AdminSidebar";
import "./AdminLayout.css";
import AdminTopbar from "../AdminTopbar/AdminTopbar";
import "../../../admin-theme.css";
import AdminThemeProvider from "../../../components/AdminTheme/AdminThemeProvider";

const AdminLayout = ({ children }) => {
  return (
    <div className="admin-theme">
      <AdminThemeProvider />
      <AdminTopbar />
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-main">
          {children}
          <div className="admin-theme-check" id="admin-theme-check"></div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
