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

    // Always use DB, even in dev; do not expose OTP in response
    await OTP.deleteMany({ email });

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email, isEmailVerified: false });
      await user.save();
    }

    // Save OTP
    await OTP.create({ userId: user._id, otpCode });

    // Send OTP email (uses Ethereal in dev)
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

    // Use database for verification in all environments
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
