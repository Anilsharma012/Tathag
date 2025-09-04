const User = require("../models/UserSchema");
const OTP = require("../models/OtpSchema");
const jwt = require("jsonwebtoken");
const { sendOtpPhoneUtil } = require("../utils/SendOtp");

exports.sendPhoneOtp = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber || phoneNumber.length !== 10) {
      return res.status(400).json({ message: "❌ Valid phone number required!" });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Development mode: skip database operations
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔥 DEV MODE: OTP for ${phoneNumber} is ${otpCode}`);
      res.status(200).json({
        message: "✅ OTP sent successfully!",
        devMode: true,
        otp: otpCode
      });
      return;
    }

    // Production mode: use database
    let user = await User.findOne({ phoneNumber });
    if (!user) {
      user = new User({ phoneNumber, isPhoneVerified: false });
      await user.save();
    }

    await OTP.create({ userId: user._id, otpCode });
    await sendOtpPhoneUtil(phoneNumber, otpCode);

    res.status(200).json({ message: "✅ OTP sent successfully!" });
  } catch (error) {
    console.error("❌ Error sending OTP:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.verifyPhoneOtp = async (req, res) => {
  try {
    const { phoneNumber, otpCode } = req.body;
    if (!phoneNumber || !otpCode) {
      return res.status(400).json({ message: "❌ Phone number and OTP required!" });
    }

    // Development mode: accept any 6-digit OTP
    if (process.env.NODE_ENV === 'development') {
      if (otpCode.length === 6 && /^\d+$/.test(otpCode)) {
        const token = jwt.sign({ phoneNumber, id: "dev_user_id" }, process.env.JWT_SECRET || 'test_secret_key_for_development', { expiresIn: '30d' });
        console.log(`🔥 DEV MODE: OTP verified for ${phoneNumber}`);

        res.status(200).json({
          message: "✅ OTP verified successfully!",
          token,
          user: { phoneNumber, name: "Dev User", _id: "dev_user_id" },
          redirectTo: "/user-details",
          devMode: true
        });
        return;
      } else {
        return res.status(400).json({ message: "❌ Invalid OTP format!" });
      }
    }

    // Production mode: use database
    let user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(404).json({ message: "❌ User not found!" });
    }

    const otpRecord = await OTP.findOne({ userId: user._id }).sort({ createdAt: -1 });
    if (!otpRecord || otpRecord.otpCode !== otpCode) {
      return res.status(400).json({ message: "❌ Invalid or expired OTP!" });
    }

    user.isPhoneVerified = true;
    await user.save({ validateBeforeSave: false });

    // Generate JWT token without role
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "default_secret_key",
      { expiresIn: "7d" }
    );

    // Redirect logic based on user info
    let redirectTo = "/student/dashboard";
    if (!user.name || !user.email || !user.city || !user.gender || !user.dob || !user.selectedCategory || !user.selectedExam) {
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
};

exports.loginWithPhone = async (req, res) => {
  try {
    const { phoneNumber, otpCode } = req.body;
    if (!phoneNumber || !otpCode) {
      return res.status(400).json({ message: "❌ Phone number and OTP required!" });
    }

    let user = await User.findOne({ phoneNumber });
    if (!user || !user.isPhoneVerified) {
      return res.status(404).json({ message: "❌ User not found or not verified!" });
    }

    const otpRecord = await OTP.findOne({ userId: user._id }).sort({ createdAt: -1 });
    if (!otpRecord || otpRecord.otpCode !== otpCode) {
      return res.status(400).json({ message: "❌ Invalid OTP!" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "default_secret_key",
      { expiresIn: "7d" }
    );

    res.status(200).json({ message: "✅ Login successful!", token, user });
  } catch (error) {
    console.error("❌ Error in login:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
