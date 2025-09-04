// Middleware/uploadMiddleware.js
const multer = require("multer");
const path = require("path");
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
try {
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
} catch (e) {
  console.error('Failed to create uploads directory', e);
}

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, filename);
  },
});

// File filter (images and PDFs)
const fileFilter = (req, file, cb) => {
  const allowed = (file.mimetype.startsWith("image/") || file.mimetype === 'application/pdf');
  if (allowed) cb(null, true);
  else cb(null, false); // multer will ignore file; route will handle missing file
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
