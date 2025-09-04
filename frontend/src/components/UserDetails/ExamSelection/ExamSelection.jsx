import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FaUserEdit } from "react-icons/fa";
import LOGO from "../../../images/tgLOGO.png"
import { FaArrowLeft } from "react-icons/fa";
import "./ExamSelection.css";

const ExamSelection = () => {
  const navigate = useNavigate();
  const { category } = useParams();
  const [selectedExam, setSelectedExam] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const examOptions = {
    MBA: ["CAT", "XAT", "MAT", "SNAP"],
    "After 12": ["CUET UG", "IPMAT Indore", "IPMAT Rohtak", "JIPMAT"],
    GMAT: ["Study Abroad", "GRE", "TOEFL", "IELTS"],
    GovtExams: ["Banking SSC", "UPSC", "Railway Exams", "State PSC"],
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setName(storedUser.name || "");
      setEmail(storedUser.email || "");
      setProfilePic(storedUser.profilePic || "https://via.placeholder.com/100");
    }
  }, []);

  const handleNext = async () => {
    if (!selectedExam) {
      alert("Please select an exam.");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");

      // Save selected exam for the user in the backend
      const response = await axios.post(
        "/api/user/save-exam",  // Corrected backend URL
        { category, exam: selectedExam },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update localStorage with selected exam
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const updatedUser = { ...storedUser, selectedExam };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Redirect to the study zone
      navigate("/student/dashboard");
    } catch (error) {
      console.error("❌ Error saving exam:", error);
      alert("Failed to save exam. Try again.");
    }
  };

  return (
    <div className="exam-selection-container">
      {/* LEFT SIDE PROFILE */}
        <div className="userdetails-left login-left-panel">
              <div className="login-logo">
          <img src={LOGO} alt="TathaGat Logo" />
          <div className="userdetails-image-wrapper editable" style={{ marginTop: "40px" }}>
          <label htmlFor="profile-pic-input">
            <img
              src={profilePic || "https://via.placeholder.com/100"}
              alt="Profile Preview"
              className="userdetails-pic"
            />
           
          </label>
        
        </div>
          <p className="login-tagline">
            Access Your Personalized <br />
            <strong>Dashboard</strong> –{" "}
            <span>
              Where Preparation
              <br />
              Meets Performance.
            </span>
          </p>
        </div>
      
        
      </div>

      {/* RIGHT SIDE DROPDOWN */}
      <div className="exam-selection-right">
        <div className="exam-selection-box">
          <div className="exam-category-back" onClick={() => navigate(-1)}>
            <FaArrowLeft style={{ marginRight: "8px" }} /> Back
          </div>
          <h2>Select Exam in {category}</h2>
          <p>Choose one of the options below</p>

          <select value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)}>
            <option value="">Choose</option>
            {examOptions[category]?.map((exam) => (
              <option key={exam} value={exam}>
                {exam}
              </option>
            ))}
          </select>

          <button onClick={handleNext} disabled={!selectedExam}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamSelection;
