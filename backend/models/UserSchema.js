const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        sparse: true, // ✅ So multiple nulls allowed
        trim: true
      },
      phoneNumber: {
        type: String,
        unique: true,
        sparse: true, // ✅ Same for phone
        match: [/^\d{10}$/, "Invalid phone number"],
      },

      


      
      
    isEmailVerified: {
        type: Boolean,
        default: false, // ✅ Pehle false rahega, OTP verify hone pe true hoga
    },
    isPhoneVerified: {
        type: Boolean,
        default: false, // ✅ Pehle false rahega, phone OTP verify hone pe true hoga
    },
    role: {
        type: String,
        enum: ["admin", "student", "subadmin"],
        default: "student", // ✅ Default role student hoga
    },
    name: {
        type: String,
        default: null, // ✅ Initially null, user enters later
    },
    dob: {
        type: String,
        default: null, // ✅ Initially null, user enters later
    },
    gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
        default: null, // ✅ Initially null
    },
    city: {
        type: String,
        default: null, // ✅ Initially null
    },
    profilePic: {
        type: String,
        default: null, // ✅ User uploads later
    },
    selectedCategory: {
        type: String,
        default: null, // ✅ MBA, GMAT, Govt Exams, etc.
    },
    enrolledCourses: [
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    status: {
      type: String,
      enum: ["locked", "unlocked"],
      default: "locked",
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
  },
],

    selectedExam: {
        type: String,
        default: null, // ✅ CAT, XAT, UPSC, GRE, etc.
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    
}
,{ timestamps: true });

module.exports = mongoose.models.User || mongoose.model("User", userSchema);

