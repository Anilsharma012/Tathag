import React from "react";
import { Outlet } from "react-router-dom";
import StudentSidebar from "../../../components/StudentSidebar/StudentSidebar";

const StudentLayout = () => {
  return (
    <div style={{ display: "flex" }}>
      <StudentSidebar />
      <div style={{ flex: 1,  }}>
        <Outlet />
      </div>
    </div>
  );
};

export default StudentLayout;
