const express = require('express');
const router = express.Router();
const Batch = require('../models/Batch');
const Session = require('../models/Session');
const Course = require('../models/course/Course');
const { adminAuth } = require('../middleware/authMiddleware');

// All endpoints admin-auth
router.use(adminAuth);

router.get('/batches', async (_req, res) => {
  const items = await Batch.find({}).sort({ updatedAt: -1 }).populate('courseIds','name');
  res.json({ success:true, items });
});

router.post('/batches', async (req, res) => {
  const { name, currentSubject='A', courseIds=[] } = req.body;
  const item = await Batch.create({ name, currentSubject, courseIds });
  res.status(201).json({ success:true, item });
});

router.patch('/batch/:id', async (req, res) => {
  const { currentSubject, courseIds } = req.body;
  const patch = {};
  if (currentSubject) patch.currentSubject = currentSubject;
  if (courseIds) patch.courseIds = courseIds;
  const item = await Batch.findByIdAndUpdate(req.params.id, patch, { new:true });
  res.json({ success:true, item });
});

router.post('/sessions', async (req, res) => {
  const { batchId, subject, startAt, endAt, joinUrl } = req.body;
  if (!batchId || !subject || !startAt || !endAt || !joinUrl) return res.status(400).json({ success:false, message:'Missing fields' });
  const batch = await Batch.findById(batchId);
  if (!batch) return res.status(404).json({ success:false, message:'Batch not found' });
  const item = await Session.create({ batchId, subject, startAt, endAt, joinUrl });
  res.status(201).json({ success:true, item });
});

router.patch('/sessions/:id', async (req, res) => {
  const item = await Session.findByIdAndUpdate(req.params.id, req.body, { new:true });
  res.json({ success:true, item });
});

module.exports = router;
