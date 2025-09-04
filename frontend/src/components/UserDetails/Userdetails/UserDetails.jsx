import React, { useState, useEffect } from "react";
import { FaUserEdit } from "react-icons/fa";
import LOGO from "../../../images/tgLOGO.png"
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./UserDetails.css";


const UserDetails = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [city, setCity] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [uploading, setUploading] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);

  const [loginMethod, setLoginMethod] = useState("");

  useEffect(() => {
    const verifyAndPrefill = async () => {
      try {
        const token = localStorage.getItem("authToken");
  
        if (!token) {
          console.error("❌ Token not found in localStorage");
          return;
        }
  
        // API call to verify token and get user details
        const response = await axios.get("/api/user/verify-token", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        const user = response.data.user;
  
        // ✅ Save user data in local storage
        localStorage.setItem("user", JSON.stringify(user));
  
        // ✅ Prefill the form fields with user data
        setLoginMethod(user.email ? "email" : "phone");
        setEmail(user.email || "");
        setPhoneNumber(user.phoneNumber || "");
        setName(user.name || "");
        setCity(user.city || "");
        setGender(user.gender || "");
        setDob(user.dob || "");
        setProfilePic(user.profilePic || "");
      } catch (err) {
        console.error("❌ Token invalid or expired:", err);
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
      }
    };
  
    verifyAndPrefill();
  }, []);

  
const handleUploadProfilePic = async () => {
  if (!selectedFile) {
    alert("Please select a file first");
    return;
  }

  const formData = new FormData();
  formData.append("profilePic", selectedFile);

  try {
    const token = localStorage.getItem("authToken");
     console.log("📦 Upload Token:", token);

    const res = await axios.post(
      "/api/user/upload-profile",
      
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const imageUrl = res.data.url;
    setProfilePic(imageUrl);

    alert("✅ Image uploaded successfully");
  } catch (error) {
    console.error("❌ Image upload failed", error);
    alert("❌ Failed to upload image");
  }
};



  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const token = localStorage.getItem("authToken");
  
      const response = await axios.post(
        "/api/user/update-details",  // Backend route update
        {
          name,
          email,
          phoneNumber,
          city,
          gender,
          dob,
          profilePic,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,  // Token for authorization
          },
        }
      );
  
      const updatedUser = {
        ...JSON.parse(localStorage.getItem("user")),
        name,
        email,
        phoneNumber,
        city,
        gender,
        dob,
        profilePic
      };
  
      localStorage.setItem("user", JSON.stringify(updatedUser));
  
      navigate("/exam-category");  // Redirect after update
    } catch (error) {
      console.error("❌ Error updating user details:", error);
    }
  };
  

  return (
    <div className="userdetails-overlay">
      <div className="userdetails-container">
        {/* LEFT SECTION */}
       <div className="userdetails-left login-left-panel">
        <div className="login-logo">
    <img src={LOGO} alt="TathaGat Logo" />
    <div className="userdetails-image-wrapper editable" style={{ marginTop: "40px" }}>
    <label htmlFor="profile-pic-input">
<img
  src={
    profilePic?.startsWith("/uploads/")
      ? `${profilePic}`
      : profilePic || "https://via.placeholder.com/100"
  }
  alt="Profile Preview"
  className="userdetails-pic"
/>

{uploading && (
  <p style={{ color: "orange", fontSize: "13px", marginTop: "5px" }}>
    ⏳ Uploading image...
  </p>
)}



      <div className="userdetails-edit-overlay">
        <FaUserEdit className="userdetails-edit-icon" />
      </div>
    </label>
    <input
      id="profile-pic-input"
      type="file"
      accept="image/*"
 onChange={async (e) => {
  const file = e.target.files[0];
  if (file) {
    setUploading(true); // ✅ START: Show loader

    const formData = new FormData();
    formData.append("profilePic", file);

    try {
      const token = localStorage.getItem("authToken");

      const res = await axios.post(
        "/api/user/upload-profile",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

   const imageUrl = res.data.url;
console.log("🖼️ Uploaded Image URL:", imageUrl);  // ✅ Already hai

setProfilePic(imageUrl); // ✅ Yeh line ke turant baad yeh laga:
console.log("✅ profilePic value set ho gayi:", imageUrl);

      // ✅ Update localStorage immediately
      const storedUser = JSON.parse(localStorage.getItem("user"));
      storedUser.profilePic = imageUrl;
      localStorage.setItem("user", JSON.stringify(storedUser));

      console.log("✅ Image uploaded");
    } catch (err) {
      console.error("❌ Upload failed", err);
    } finally {
      setUploading(false); // ✅ END: Hide loader
    }
  }
}}



      style={{ display: "none" }}
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


        {/* RIGHT SECTION */}
        <div className="userdetails-right">
          <div className="userdetails-form-wrapper">
            <h2>Update profile</h2>
            <p>Please fill out the following details.</p>

            <div className="userdetails-group">
              <label>Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {loginMethod === "phone" && (
              <div className="userdetails-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            )}

            {loginMethod === "email" && (
              <div className="userdetails-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="userdetails-group">
              <label>Address</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>

            <div className="userdetails-group">
              <label>Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="userdetails-group">
              <label>D.O.B</label>  
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                required
              />
            </div>

            <button onClick={handleSubmit} className="userdetails-btn">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
