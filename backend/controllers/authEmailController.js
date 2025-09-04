// Controllers/authEmailController.js

const User = require("../models/UserSchema")
const OTP = require("../models/OtpSchema");
const jwt = require("jsonwebtoken");
const { sendOtpEmailUtil } = require("../utils/SendOtp");

exports.sendEmailOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Development mode: skip database operations but still send email
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔥 DEV MODE: OTP for ${email} is ${otpCode}`);

      // Try to send actual email
      try {
        await sendOtpEmailUtil(email, otpCode);
        console.log(`📧 Email sent to ${email}`);
      } catch (emailError) {
        console.log(`❌ Email failed for ${email}:`, emailError.message);
      }

      res.status(200).json({
        message: "OTP sent successfully",
        devMode: true,
        otp: otpCode  // Include OTP in response for testing
      });
      return;
    }

    // Production mode: use database
    // Delete old OTPs for this email
    await OTP.deleteMany({ email });

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email, isEmailVerified: false });
      await user.save();
    }

    // Save OTP
    await OTP.create({ userId: user._id, otpCode });

    // Send OTP email
    await sendOtpEmailUtil(email, otpCode);

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Email OTP Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.verifyEmailOtp = async (req, res) => {
  try {
    const { email, otpCode } = req.body;
    if (!email || !otpCode) return res.status(400).json({ message: "Email and OTP required" });

    // Development mode: accept any 6-digit OTP
    if (process.env.NODE_ENV === 'development') {
      if (otpCode.length === 6 && /^\d+$/.test(otpCode)) {
        const token = jwt.sign({ email, id: "dev_user_id" }, process.env.JWT_SECRET || 'test_secret_key_for_development', { expiresIn: '30d' });
        console.log(`🔥 DEV MODE: OTP verified for ${email}`);

        res.status(200).json({
          message: "OTP verified successfully",
          token,
          user: { email, name: "Dev User", _id: "dev_user_id" },
          redirectTo: "/user-details",
          devMode: true
        });
        return;
      } else {
        return res.status(400).json({ message: "Invalid OTP format" });
      }
    }

    // Production mode: use database
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Get the most recent OTP for this user
    const otpRecord = await OTP.findOne({ userId: user._id }).sort({ createdAt: -1 });
    if (!otpRecord || otpRecord.otpCode !== otpCode) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Mark email as verified
    user.isEmailVerified = true;
    await user.save({ validateBeforeSave: false });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "default_secret_key",
      { expiresIn: "7d" }
    );

    // Redirect to the profile update page if user info is incomplete
    let redirectTo = "/student/dashboard";
    if (!user.name || !user.phoneNumber || !user.city || !user.gender || !user.dob || !user.selectedCategory || !user.selectedExam) {
      redirectTo = "/user-details"; // Redirect to user details page if information is incomplete
    } else if (user.selectedCategory && !user.selectedExam) {
      redirectTo = `/exam-selection/${user.selectedCategory}`;
    } else if (!user.selectedCategory) {
      redirectTo = "/exam-category";
    }

    res.status(200).json({ message: "OTP verified successfully", token, user, redirectTo });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
