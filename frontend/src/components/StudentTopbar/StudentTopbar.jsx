import React, { useContext, useRef, useState, useEffect } from "react";
import { UserContext } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./StudentTopbar.css";

const StudentTopbar = () => {
  const { user, updateUser } = useContext(UserContext);
  const navigate = useNavigate();
  const fileInputRef = useRef();
  const [imageSrc, setImageSrc] = useState("");

  // ✅ Set image from global context
  useEffect(() => {
    if (user?.profilePic) {
      setImageSrc(user.profilePic);
    }
  }, [user]);

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profilePic", file);

    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.post("/api/user/upload-profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      const imageUrl = res.data.url;

      // ✅ Global update
      updateUser({ profilePic: imageUrl });
      setImageSrc(imageUrl); // Optional: for instant preview without waiting for context refresh
    } catch (err) {
      console.error("❌ Image upload failed", err);
      alert("Failed to upload image");
    }
  };

  return (
    <div className="ttstudent-topbar">
      <div className="ttleft">
        <i className="ttmenu-icon">&#9776;</i>
        <h3 className="page-title">My Courses</h3>
      </div>

      <div className="ttright">
        <div className="ttsearch-wrapper">
          <input type="text" placeholder="Search..." />
          <i className="ttsearch-icon">🔍</i>
        </div>

        <i className="tticon ttflash-icon" title="Shortcuts">⚡</i>

        <div className="ttnotification-wrapper" title="Notifications">
          <i className="tticon bell-icon">🔔</i>
        </div>

        <div className="ttprofile-section" onClick={handleImageClick} title="Click to upload image">
          <img
            src={imageSrc || "https://via.placeholder.com/100"}
            className="ttprofile-pic"
            alt="Profile"
          />
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </div>

        <button className="ttback-btn" onClick={() => navigate("/")}>
          🔙 Back to Website
        </button>
      </div>
    </div>
  );
};

export default StudentTopbar;
