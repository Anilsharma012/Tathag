import React from "react";
import AdminSidebar from "../AdminSidebar/AdminSidebar"; // ✅ same folder
import "./AdminLayout.css"; // ✅ CSS present?
import AdminTopbar from "../AdminTopbar/AdminTopbar";

const AdminLayout = ({ children }) => {
  return (
    <div>
      <AdminTopbar/>
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">{children}</div>
    </div>
    </div>
  );
};

export default AdminLayout;
