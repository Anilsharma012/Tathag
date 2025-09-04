const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { authMiddleware } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, fileFilter: (req, file, cb) => {
  const ok = /pdf|jpg|jpeg|png$/i.test(file.originalname);
  cb(ok ? null : new Error('Invalid file type'), ok);
}});

router.post('/evaluate', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success:false, message:'File required' });
    let text = '';
    if (/\.pdf$/i.test(req.file.originalname)) {
      try {
        const fs = require('fs');
        const buf = fs.readFileSync(req.file.path);
        const data = await pdfParse(buf);
        if (data && data.text) text = data.text.slice(0, 5000);
      } catch {}
    }
    if (!text) text = `File uploaded: ${req.file.originalname} (${req.file.mimetype})`;
    const score = Math.min(100, Math.max(0, Math.round(text.length % 100)));
    const remarks = score > 70 ? 'Good attempt' : (score > 40 ? 'Needs improvement' : 'Work on fundamentals');
    res.json({ success:true, result: { text, score, remarks, fileUrl: `/uploads/${req.file.filename}` } });
  } catch (e) {
    res.status(500).json({ success:false, message:e.message });
  }
});

module.exports = router;
