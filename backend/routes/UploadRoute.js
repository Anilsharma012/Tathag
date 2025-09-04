const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();

// 🛠 Storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // uploads folder
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = Date.now() + ext;
    cb(null, filename);
  }
});

// 📦 Multer middleware
const upload = multer({ storage: storage });

// 📤 Upload route
router.post("/", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;
  return res.status(200).json({ success: true, url: fileUrl });
});

module.exports = router;
