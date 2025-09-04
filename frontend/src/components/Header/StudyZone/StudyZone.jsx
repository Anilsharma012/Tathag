import React, { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import "./StudyZone.css";
 
import IIMPage from "../../Student/IIMPage/IIMPage";


const StudyZone = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [selectedSection, setSelectedSection] = useState("dashboard"); // ✅ Default view

  

    useEffect(() => {
        let storedUser = null;
        try {
          const userStr = localStorage.getItem("user");
          if (userStr && userStr !== "undefined") {
            storedUser = JSON.parse(userStr);
          }
        } catch (e) {
          console.error("❌ Failed to parse user:", e);
          storedUser = null;
        }
      
        if (!storedUser || !storedUser.token) {
          console.warn("❌ No valid user found, redirecting to login...");
          localStorage.removeItem("user");
          navigate("/login");
        } else {
          console.log("✅ User Loaded:", storedUser);
          setUser(storedUser);
        }
      }, [navigate]);
      
        // ✅ Dependency added to avoid unnecessary re-renders

    // ✅ **Avoid rendering the dashboard if user data is not loaded**
    if (!user) {
        return <h2>Loading Dashboard...</h2>;
    }
    
    



    return (
        <div className="dashboard-container">
            <aside className="sidebar">
                <div className="user-info">
                <img src={user?.profilePic || "/default-avatar.png"} alt="Profile" className="profile-pic" />
                    <h3>{user.name || "User"}</h3>
                    <p>ID: {user._id}</p>
                    <p>Email: {user.email}</p>
                    <p>Phone: {user.phoneNumber || "N/A"}</p>
                    <p>Gender: {user.gender || "N/A"}</p>
                    <p>DOB: {user.dob || "N/A"}</p>
                    <div className="exam-tags">
                        {user.selectedExams?.map((exam, index) => (
                            <span key={index} className="exam-tag">{exam}</span>
                        ))}
                    </div>
                </div>
                <nav>
                    <ul>
                    <li className={selectedSection === "dashboard" ? "active" : ""} onClick={() => setSelectedSection("dashboard")}>Dashboard</li>
                        <li className={selectedSection === "iimPredictor" ? "active" : ""} onClick={() => setSelectedSection("iimPredictor")}>IIM Predictor</li>
                        <li>Exam Details</li>
                        <li>Strategy</li>
                        <li>Classes</li>
                        <li>My Courses</li>
                        <li>Mocks</li>
                        <li>Free Material</li>
                    </ul>
                </nav>
            </aside>

            <main className="dash-content">
            <header className="dash-header fixed-header">
        <h1>Welcome to your dashboard, {user.name}!</h1>
        <p>This is your StudyZone. More features coming soon...</p>
    </header>


 

                <section className="dash-statics">
                    <div className="static-card">
                        <h3>Total Courses</h3>
                        <p>0</p>
                    </div>
                    <div className="static-card">
                        <h3>Total Mocks</h3>
                        <p>0</p>
                    </div>
                    <div className="static-card">
                        <h3>Total Earnings</h3>
                        <p>0</p>
                    </div>
                    <div className="static-card">
                        <h3>Your Goal</h3>
                        <button className="set-goal-btn">Set now</button>
                    </div>
                </section>

                <div className="content-area">
        {/* {selectedSection === "dashboard" && <DashboardContent />} */}
        {selectedSection === "iimPredictor" && <IIMPage user={user} />}
    </div>

             
              
            </main>
        </div>
    );
};

export default StudyZone;
