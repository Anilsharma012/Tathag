const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authMiddleware } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, fileFilter: (req, file, cb) => {
  const ok = /pdf|jpg|jpeg|png|zip$/i.test(file.originalname);
  cb(ok ? null : new Error('Invalid file type'), ok);
}});

router.post('/check', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success:false, message:'File required' });
    const totalQuestions = 50;
    const size = req.file.size || 0;
    const correct = size % (totalQuestions + 1);
    const incorrect = Math.max(0, totalQuestions - correct);
    const score = correct * 2 - incorrect * 0.66;
    res.json({ success:true, result: { totalQuestions, correct, incorrect, score, fileUrl: `/uploads/${req.file.filename}` } });
  } catch (e) {
    res.status(500).json({ success:false, message:e.message });
  }
});

module.exports = router;
