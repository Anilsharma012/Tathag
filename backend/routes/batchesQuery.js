const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/permissionMiddleware');
const Batch = require('../models/Batch');

router.get('/batches', authMiddleware, checkPermission('course_read'), async (req, res) => {
  try {
    const { courseId } = req.query;
    let q = {};
    if (courseId) {
      q = { $or: [ { courseId }, { courseIds: courseId } ] };
    }
    const items = await Batch.find(q).select('_id name code');
    res.json({ success:true, items });
  } catch (e) {
    res.status(500).json({ success:false, message: e.message });
  }
});

module.exports = router;
