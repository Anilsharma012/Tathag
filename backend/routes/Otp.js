const express = require("express");
const { sendOtpEmailUtil, sendOtpPhoneUtil } = require("../utils/SendOtp");
const User = require("../models/UserSchema");
const OTP = require("../models/OtpSchema");
const { authMiddleware, adminAuth } = require("../middleware/authMiddleware");
const jwt = require("jsonwebtoken");

const mongoose=require("mongoose")


const router = express.Router();





router.post("/update-details", authMiddleware, async (req, res) => {
  console.log("✅ Token Decoded User:", req.user);

  try {
    const userId = req.user.id; // ✅ Extracted from JWT
    const { name, email, phoneNumber, city, gender, dob, profilePic } = req.body;

    let user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name;
    user.email = email;
    user.phoneNumber = phoneNumber;
    user.city = city;
    user.gender = gender;
    user.dob = dob;
    user.profilePic = profilePic;
    await user.save();

    res.json({ message: "User details updated successfully", user, redirectTo: "/exam-category" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


router.post("/save-category", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { category } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "❌ User not found" });

    user.selectedCategory = category;
    await user.save();

    res.status(200).json({
      message: "✅ Exam category saved successfully",
      redirectTo: `/exam-selection/${category}`
    });
  } catch (error) {
    console.error("❌ Error saving category:", error);
    res.status(500).json({ message: "Server error" });
  }
});




router.post("/save-exam", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; // ✅ Get from token
    const { category, exam } = req.body;

    if (!category || !exam) {
      return res.status(400).json({ message: "❌ Category and Exam are required" });
    }

    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "❌ User not found" });
    }

    user.selectedCategory = category;
    user.selectedExam = exam;
    await user.save();

    res.status(200).json({
      message: "✅ Exam saved successfully",
      redirectTo: "/study-zone"
    });
  } catch (error) {
    console.error("❌ Error saving exam:", error);
    res.status(500).json({ message: "Server error" });
  }
});




router.post("/send-email", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // ✅ Delete Old OTP Before Creating New One
    await OTP.deleteMany({ email });

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email, isEmailVerified: false });
      await user.save();
    }

    await OTP.create({ userId: user._id, otpCode });

    await sendOtpEmailUtil(email, otpCode);

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// Send OTP to Phone
router.post("/send-phone", async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    // **Check if User Exists**
    let user = await User.findOne({ phoneNumber });
    if (!user) {
      user = await User.create({ phoneNumber, isPhoneVerified: false });
    }

    // **Generate OTP**
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // **Save OTP in Database**
    await OTP.create({ userId: user._id, otpCode });

    // **Send OTP via Fast2SMS**

    await sendOtpPhoneUtil(phoneNumber, otpCode);

    res.status(200).json({ message: "OTP sent successfully to Phone" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});



router.post("/verify", async (req, res) => {
  try {
    console.log("🔍 Verifying OTP for:", req.body.email); // Debugging
    const { email, otpCode } = req.body;

    if (!otpCode || !email) {
        console.error("❌ Missing OTP or Email");
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    let user = await User.findOne({ email });

    if (!user) {
        console.error("❌ User Not Found:", email);
      return res.status(400).json({ message: "User not found" });
    }

    const otpRecord = await OTP.findOne({ userId: user._id }).sort({ createdAt: -1 });

    if (!otpRecord || otpRecord.otpCode !== otpCode) {
        console.error("❌ Invalid OTP:", otpCode);
      return res.status(400).json({ message: "Invalid or Expired OTP" });
    }
    console.log("✅ OTP Verified Successfully for:", email);

    user.isEmailVerified = true;
    await user.save({ validateBeforeSave: false });

    user = await User.findById(user._id);

    // ✅ Generate JWT Token
    const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET || "default_secret_key", // ✅ Ensure JWT_SECRET is always available
        { expiresIn: "1h" }
      );

    // ✅ Determine Redirect Path
    let redirectTo = "/study-zone";  
    const adminEmails = ["takoria2204@gmail.com", "superadmin@lms.com"];
    if (adminEmails.includes(user.email)) {
        redirectTo = "/admin-dashboard"; 
    } else if (user.role === "subadmin") {
        redirectTo = "/subadmin-dashboard"; 
    } else if (!user.name || !user.phoneNumber || !user.city || !user.gender || !user.dob || !user.selectedCategory || !user.selectedExam) {
        redirectTo = "/user-details"; 
    } else if (user.selectedCategory && !user.selectedExam) {
        redirectTo = `/exam-selection/${user.selectedCategory}`;
    } else if (!user.selectedCategory) {
        redirectTo = "/exam-category";
    }

    res.status(200).json({
        message: "OTP verified successfully",
        token,  // ✅ Send token in response
        user,
        redirectTo,
    });

  } catch (error) {
    console.error("❌ Server Error in OTP Verification:", error);
    res.status(500).json({ message: "Server error", error });
  }
});



router.get("/auto-login", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; // ✅ token se mila

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "❌ User not found!" });
    }

    let redirectTo = "/user-details";
    if (
      user.name && user.phone && user.city &&
      user.gender && user.dob &&
      user.selectedCategory && user.selectedExam
    ) {
      redirectTo = "/study-zone";
    } else if (user.selectedCategory && !user.selectedExam) {
      redirectTo = `/exam-selection/${user.selectedCategory}`;
    } else if (!user.selectedCategory) {
      redirectTo = "/exam-category";
    }

    res.status(200).json({
      exists: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        city: user.city,
        gender: user.gender,
        dob: user.dob,
        selectedCategory: user.selectedCategory,
        selectedExam: user.selectedExam
      },
      redirectTo
    });
  } catch (error) {
    console.error("❌ Server Error in Auto Login:", error);
    res.status(500).json({ message: "Server error", error });
  }
});




router.get("/get-students", adminAuth, async (req, res) => {

    try {
        const students = await User.find({ role: "student" }).select("name email phoneNumber selectedCategory selectedExam createdAt");
        res.status(200).json({ students });
    } catch (error) {
        console.error("❌ Error fetching students:", error);
        res.status(500).json({ message: "Server error" });
    }
});



// ✅ Update Student API
router.put("/update-student/:id", adminAuth, async (req, res) => {

    try {
        const { id } = req.params;
        const updatedData = req.body;

        // ✅ Check if user exists
        let student = await User.findById(id);
        if (!student) {
            return res.status(404).json({ message: "Student not found!" });
        }

        // ✅ Update Student Data
        student = await User.findByIdAndUpdate(id, updatedData, { new: true });

        res.status(200).json({ message: "✅ Student updated successfully!", student });
    } catch (error) {
        console.error("❌ Error updating student:", error);
        res.status(500).json({ message: "Server error", error });
    }
});

// ✅ Delete Student API
router.delete("/delete-student/:id", adminAuth, async (req, res) => {

    try {
        const { id } = req.params;

        // ✅ Check if user exists
        let student = await User.findById(id);
        if (!student) {
            return res.status(404).json({ message: "Student not found!" });
        }

        // ✅ Delete the Student
        await User.findByIdAndDelete(id);

        res.status(200).json({ message: "✅ Student deleted successfully!" });
    } catch (error) {
        console.error("❌ Error deleting student:", error);
        res.status(500).json({ message: "Server error", error });
    }
});


router.post("/check-user", async (req, res) => {
    try {
        const { email } = req.body;

        console.log("🔍 Checking user existence for:", email);

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        let user = await User.findOne({ email });

        if (!user) {
            console.log("❌ User Not Found!");
            return res.status(200).json({ exists: false });
        }

        console.log("✅ User Found:", user._id);

        let redirectTo = "/user-details";
        if (user.name && user.phoneNumber && user.gender) {
            redirectTo = "/study-zone";  // ✅ Agar user ki details pehle se hain to direct StudyZone bhejo
        }

        res.status(200).json({ exists: true, user, redirectTo });

    } catch (error) {
        console.error("❌ Server Error in Checking User:", error);
        res.status(500).json({ message: "Server error", error });
    }
});


router.post("/login-phone", async (req, res) => {
    try {
      const { phoneNumber, otpCode } = req.body;
  
      if (!phoneNumber || !otpCode) {
        return res.status(400).json({ message: "❌ Phone number and OTP required!" });
      }
  
      // ✅ 1️⃣ Check if User Exists
      let user = await User.findOne({ phoneNumber });
  
      if (!user || !user.isPhoneVerified) {
        return res.status(404).json({ message: "❌ User not found or not verified!" });
      }
  
      // ✅ 2️⃣ Check OTP
      const otpRecord = await OTP.findOne({ userId: user._id }).sort({ createdAt: -1 });
  
      if (!otpRecord || otpRecord.otpCode !== otpCode) {
        return res.status(400).json({ message: "❌ Invalid OTP!" });
      }
  
      // ✅ 3️⃣ Generate JWT Token
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET || "default_secret_key",
        { expiresIn: "1h" }
      );
  
      res.status(200).json({ message: "✅ Login successful!", token, user });
    } catch (error) {
      console.error("❌ Error in login:", error);
      res.status(500).json({ message: "Server error", error });
    }
  });


router.post("/send-otp", async (req, res) => {
    try {
      const { phoneNumber } = req.body;
  
      if (!phoneNumber || phoneNumber.length !== 10) {
        return res.status(400).json({ message: "❌ Valid phone number required!" });
      }
  
      // ✅ 2️⃣ Check if User Already Exists
      let user = await User.findOne({ phoneNumber });
      if (!user) {
        user = new User({ phoneNumber, isPhoneVerified: false });
        await user.save();
      }
  
      // ✅ 3️⃣ Generate OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  
      // ✅ 4️⃣ OTP Database Me Store Karo
      await OTP.create({ userId: user._id, otpCode });
  
      // ✅ 5️⃣ OTP SMS Ke Through Bhejo
      await sendOtpPhoneUtil(phoneNumber, otpCode);
  
      res.status(200).json({ message: "✅ OTP sent successfully!" }); // ❌ Don't expose ID

    } catch (error) {
      console.error("❌ Error sending OTP:", error);
      res.status(500).json({ message: "Server error", error });
    }
  });

  
router.post("/mobileVerify-otp", async (req, res) => {
    try {

      const { phoneNumber, otpCode } = req.body;
  
      if (!phoneNumber || !otpCode) {
        return res.status(400).json({ message: "❌ Phone number and OTP required!" });
      }
  
      // ✅ 1️⃣ Check if User Exists
      let user = await User.findOne({ phoneNumber });
      if (!user) {
        return res.status(404).json({ message: "❌ User not found!" });
      }
  
      // ✅ 2️⃣ Get Latest OTP from Database
      const otpRecord = await OTP.findOne({ userId: user._id }).sort({ createdAt: -1 });
  
      if (!otpRecord || otpRecord.otpCode !== otpCode) {
        return res.status(400).json({ message: "❌ Invalid or expired OTP!" });
      }
  
      // ✅ 3️⃣ Mark User as Verified
      user.isPhoneVerified = true;
      await user.save({ validateBeforeSave: false });
  
      // ✅ 4️⃣ Generate JWT Token
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET || "default_secret_key",
        { expiresIn: "1h" }
      );
  
      // ✅ 5️⃣ Smart Redirect Logic
      let redirectTo = "/study-zone";  
    const adminPhone = ["7015242845", "7015242846"];
    if (adminPhone.includes(user.phoneNumber)) {
        redirectTo = "/admin-dashboard"; 
    } else if (user.role === "subadmin") {
        redirectTo = "/subadmin-dashboard"; 
    } else if (!user.name || !user.email || !user.city || !user.gender || !user.dob || !user.selectedCategory || !user.selectedExam) {
        redirectTo = "/user-details"; 
    } else if (user.selectedCategory && !user.selectedExam) {
        redirectTo = `/exam-selection/${user.selectedCategory}`;
    } else if (!user.selectedCategory) {
        redirectTo = "/exam-category";
    }
  
      res.status(200).json({
        message: "✅ Mobile number verified successfully!",
        token,
        user,
        redirectTo,
      });
  
    } catch (error) {
      console.error("❌ Error verifying OTP:", error);
      res.status(500).json({ message: "Server error", error });
    }
  });
  
  
  router.get("/verify-token", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    // ✅ Token Missing
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "❌ Token missing or invalid!" });
    }

    // ✅ Decode Token
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret_key");

    // ✅ Find User
    const user = await User.findById(decoded.id)

    if (!user) {
      return res.status(404).json({ message: "❌ User not found!" });
    }

    // ✅ Return User + Optional redirect suggestion
    let redirectTo = "/user-details";

    if (
      user.name && user.city && user.gender &&
      user.dob && user.selectedCategory && user.selectedExam
    ) {
      redirectTo = "/study-zone";
    } else if (user.selectedCategory && !user.selectedExam) {
      redirectTo = `/exam-selection/${user.selectedCategory}`;
    } else if (!user.selectedCategory) {
      redirectTo = "/exam-category";
    }

    return res.status(200).json({ user, redirectTo });

  } catch (err) {
    console.error("❌ Token verify error:", err);
    return res.status(401).json({ message: "❌ Token expired or invalid!" });
  }
});
 







module.exports = router;
