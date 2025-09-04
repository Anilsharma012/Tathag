import React from "react";
import "./StudentSidebar.css";
import TGLOGO from "../../images/TGLogo.webp";
import { Link } from "react-router-dom";

const StudentSidebar = ({ isOpen, closeSidebar }) => {
  return (
    <>
      {/* Backdrop (only shows on mobile) */}
      {isOpen && <div className="sidebar-backdrop" onClick={closeSidebar}></div>}

      <div className={`student-sidebar ${isOpen ? "show" : "hidden"}`}>
        <div className="logo">
          <img src={TGLOGO} alt="Logo" />
          <button className="login-btn">Login</button>
        </div>

        <div className="menu">
          <p className="menu-title">MENU</p>
          <ul>
            <li>
              <Link to="/student/dashboard" className="sidebar-link">
                🏠 Home
              </Link>
            </li>
            <li><span className="sidebar-link">📝 Test</span></li>
            <li><Link to="/student/practice-tests" className="sidebar-link">📋 Practice Tests</Link></li>
            <li><Link to="/student/my-courses" className="sidebar-link" >📚 My Courses</Link></li>
            <li><Link to="/student/mock-tests" className="sidebar-link">🧪 Mock Tests</Link></li>
            <li><Link to="/student/live-classes" className="sidebar-link">🎥 Live Classes</Link></li>
            <li><Link to="/student/my-progress" className="sidebar-link">📊 My Progress</Link></li>
            <li><Link to="/student/ocr-upload" className="sidebar-link">📝 OCR Upload</Link></li>
            <li><Link to="/student/omr-upload" className="sidebar-link">🖨️ OMR Upload</Link></li>
            <li><Link to="/student/reports" className="sidebar-link">📄 Reports</Link></li>
            <li><Link to="/student/purchase-history" className="sidebar-link">🧾 Purchase History</Link></li>
            <li><span className="sidebar-link">ℹ️ Exams Info</span></li>
            <li><span className="sidebar-link">📖 Books</span></li>
            <li><span className="sidebar-link">📘 E-Books</span></li>
            <li><span className="sidebar-link">📰 Articles</span></li>
            <li><span className="sidebar-link">📞 Connect with Teacher</span></li>
            <li><span className="sidebar-link">�� Special Sessions</span></li>
            <li><span className="sidebar-link">🏆 Achievers Story</span></li>
            <li><span className="sidebar-link">📅 Daily/Weekly Doses</span></li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default StudentSidebar;
