const SubAdmin = require("../models/SubAdmin");
const bcrypt = require("bcrypt");

// Create SubAdmin (Admin ke dwara)
exports.createSubAdmin = async (req, res) => {
    try {
      const {name, email, password } = req.body;
  
      // Middleware me decoded token 'req.user' me aayega, usme id le lo
      const adminId = req.user.id;  // req.adminId nahi, balki req.user.id
  
      if (!email || !password || !name) {
        return res.status(400).json({ message: " Name and Email and password required" });
      }
  
      const existing = await SubAdmin.findOne({ email });
      if (existing) {
        return res.status(400).json({ message: "SubAdmin already exists" });
      }
  
      const subAdmin = new SubAdmin({name, email, password, createdByAdmin: adminId });
      await subAdmin.save();
  
      res.status(201).json({ message: "SubAdmin created successfully", subAdmin });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  };
  

// Get all SubAdmins (created by this Admin)
exports.getSubAdmins = async (req, res) => {
  try {
    const adminId = req.user.id;

    const subAdmins = await SubAdmin.find({ createdByAdmin: adminId }).select("-password");
    res.json({ subAdmins });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update SubAdmin info (email, isActive etc.)
exports.updateSubAdmin = async (req, res) => {
  try {
    const subAdminId = req.params.id;
    const { email, name, isActive } = req.body;

    const subAdmin = await SubAdmin.findById(subAdminId);
    if (!subAdmin) {
      return res.status(404).json({ message: "SubAdmin not found" });
    }

    if (email) subAdmin.email = email;
    if (name) subAdmin.name = name; // ✅ Add this line
    if (typeof isActive === "boolean") subAdmin.isActive = isActive;

    await subAdmin.save();
    res.json({ message: "SubAdmin updated", subAdmin });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// Change SubAdmin password
exports.changePassword = async (req, res) => {
  try {
    const subAdminId = req.params.id;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: "New password required" });
    }

    const subAdmin = await SubAdmin.findById(subAdminId);
    if (!subAdmin) {
      return res.status(404).json({ message: "SubAdmin not found" });
    }

    subAdmin.password = newPassword; // pre-save middleware will hash
    await subAdmin.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete SubAdmin
exports.deleteSubAdmin = async (req, res) => {
  try {
    const subAdminId = req.params.id;

    const subAdmin = await SubAdmin.findById(subAdminId);
    if (!subAdmin) {
      return res.status(404).json({ message: "SubAdmin not found" });
    }

    await SubAdmin.deleteOne({ _id: subAdminId });
    res.json({ message: "SubAdmin deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// SubAdmin login route (email/password + JWT)
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "secret_subadmin_key";

exports.subAdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const subAdmin = await SubAdmin.findOne({ email });
    if (!subAdmin) {
      return res.status(404).json({ message: "SubAdmin not found" });
    }

    if (!subAdmin.isActive) {
      return res.status(403).json({ message: "SubAdmin account is disabled" });
    }

    const isMatch = await bcrypt.compare(password, subAdmin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: subAdmin._id, role: "subadmin" }, JWT_SECRET, { expiresIn: "1d" });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
