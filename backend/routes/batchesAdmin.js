const express = require('express');
const router = express.Router();
const Batch = require('../models/Batch');
const Session = require('../models/Session');
const Course = require('../models/course/Course');
const Subject = require('../models/course/Subject');
const { adminAuth } = require('../middleware/authMiddleware');

// All endpoints admin-auth
router.use(adminAuth);

router.get('/batches', async (_req, res) => {
  const items = await Batch.find({}).sort({ updatedAt: -1 }).populate('courseIds','name');
  res.json({ success:true, items });
});

router.post('/batches', async (req, res) => {
  const { name, currentSubject='A', courseIds=[], courseId=null } = req.body;
  const item = await Batch.create({ name, currentSubject, courseIds, courseId });
  res.status(201).json({ success:true, item });
});

router.patch('/batch/:id', async (req, res) => {
  const { currentSubject, courseIds, courseId } = req.body;
  const patch = {};
  if (currentSubject) patch.currentSubject = currentSubject;
  if (courseIds) patch.courseIds = courseIds;
  if (courseId) patch.courseId = courseId;
  const item = await Batch.findByIdAndUpdate(req.params.id, patch, { new:true });
  res.json({ success:true, item });
});

// Set the active subject for a batch
router.patch('/batches/:batchId/active-subject', async (req, res) => {
  const { batchId } = req.params;
  const { subjectId } = req.body;
  if (!subjectId) return res.status(400).json({ success:false, message:'subjectId is required' });

  const batch = await Batch.findById(batchId);
  if (!batch) return res.status(404).json({ success:false, message:'Batch not found' });

  const subject = await Subject.findById(subjectId);
  if (!subject) return res.status(404).json({ success:false, message:'Subject not found' });

  // Validate subject belongs to the batch's course(s)
  const linkedCourseIds = [batch.courseId, ...(batch.courseIds || [])].filter(Boolean).map(String);
  if (linkedCourseIds.length && !linkedCourseIds.includes(String(subject.courseId))) {
    return res.status(400).json({ success:false, message:'Subject does not belong to this batch\'s courses' });
  }

  batch.activeSubjectId = subjectId;
  await batch.save();
  res.json({ success:true, batch: { _id: batch._id, activeSubjectId: batch.activeSubjectId } });
});

// Optional: add or update a schedule entry
router.post('/batches/:batchId/schedule', async (req, res) => {
  const { batchId } = req.params;
  const { subjectId, openAt } = req.body;
  if (!subjectId) return res.status(400).json({ success:false, message:'subjectId is required' });

  const batch = await Batch.findById(batchId);
  if (!batch) return res.status(404).json({ success:false, message:'Batch not found' });

  batch.schedule = batch.schedule || [];
  const idx = batch.schedule.findIndex(s => String(s.subjectId) === String(subjectId));
  if (idx >= 0) {
    batch.schedule[idx].openAt = openAt ? new Date(openAt) : null;
  } else {
    batch.schedule.push({ subjectId, openAt: openAt ? new Date(openAt) : null });
  }
  await batch.save();
  res.status(201).json({ success:true, schedule: batch.schedule });
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
