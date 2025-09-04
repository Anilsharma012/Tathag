import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaUserEdit } from "react-icons/fa";
import axios from "axios";
import LOGO from "../../../images/tgLOGO.png";
import "./ExamCategory.css";

const ExamCategory = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const categories = ["MBA", "After 12", "GMAT", "GovtExams"];

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setName(storedUser.name || "");
      setEmail(storedUser.email || "");
      setProfilePic(storedUser.profilePic || "https://via.placeholder.com/100");
    }
  }, []);

  const handleNext = async () => {
    if (!selectedCategory) {
      alert("Please select a category.");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");

      const response = await axios.post(
        "/api/user/save-category",
        { category: selectedCategory },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedUser = { ...JSON.parse(localStorage.getItem("user")), selectedCategory };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      navigate(`/exam-selection/${selectedCategory}`);
    } catch (error) {
      console.error("❌ Error saving category:", error);
      alert("Failed to save category. Try again.");
    }
  };

  return (
    <div className="exam-category-container">
      {/* LEFT SIDE PROFILE */}
      <div className="userdetails-left login-left-panel">
        <div className="login-logo">
          <img src={LOGO} alt="TathaGat Logo" />

          <div className="userdetails-image-wrapper" style={{ marginTop: "40px" }}>
            <img
              src={profilePic || "https://via.placeholder.com/100"}
              alt="Profile"
              className="userdetails-pic"
            />
           
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
      <div className="exam-category-right">
        <div className="exam-category-box">
          <div className="exam-category-back" onClick={() => navigate(-1)}>
            <FaArrowLeft style={{ marginRight: "8px" }} /> Back
          </div>
          <h2>Select the category of exam</h2>
          <p>What course are you looking for?</p>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Choose</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <button onClick={handleNext} disabled={!selectedCategory}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamCategory;
