const express = require('express');
const router = express.Router();
const Course = require('../models/course/Course');
const Enrollment = require('../models/Enrollment');
const SubjectProgress = require('../models/SubjectProgress');
const Batch = require('../models/Batch');
const Session = require('../models/Session');
const { authMiddleware } = require('../middleware/authMiddleware');

const rotate = (arr, start) => {
  const i = Math.max(0, arr.findIndex(x => x === start));
  return arr.slice(i).concat(arr.slice(0,i));
};
const nextSubject = async (enrollment, course) => {
  const order = rotate((course.subjects && course.subjects.length ? course.subjects : ['A','B','C','D']), course.startSubject || 'A');
  const done = await SubjectProgress.find({ enrollmentId: enrollment._id, status: 'done' });
  const doneSet = new Set(done.map(d => d.subject));
  for (const s of order) { if (!doneSet.has(s)) return s; }
  return null; // all done
};

router.get('/student/next-step', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const courseId = req.query.courseId || null;
    const now = new Date();

    let enrollment = null;
    if (courseId) enrollment = await Enrollment.findOne({ userId, courseId });
    else enrollment = await Enrollment.findOne({ userId }).sort({ updatedAt: -1 });

    if (!enrollment) return res.json({ success:true, hasEnrollment:false });

    const course = await Course.findById(enrollment.courseId);
    const next = await nextSubject(enrollment, course);
    const validityOver = now > new Date(enrollment.validTill);

    // find master batch covering this course
    const batch = await Batch.findOne({ courseIds: course._id }) || await Batch.findOne();

    // fetch nearest sessions for the subject we want the student to work on next
    const sessions = next && batch ? await Session.find({ subject: next, batchId: batch._id }).sort({ startAt: 1 }).limit(5) : [];

    // live joinable only within time window: startAt - 10m .. endAt
    const liveWindowSession = sessions.find(s => {
      const startWindow = new Date(new Date(s.startAt).getTime() - 10 * 60 * 1000);
      const end = new Date(s.endAt);
      return now >= startWindow && now <= end;
    }) || null;

    const joinable = !!(
      enrollment.status === 'active' &&
      next &&
      batch &&
      batch.currentSubject === next &&
      !validityOver &&
      liveWindowSession
    );

    const resp = {
      success:true,
      enrollment:{ id: enrollment._id, status: enrollment.status, validTill: enrollment.validTill, courseId: String(enrollment.courseId) },
      course:{ id: String(course._id), name: course.name, startSubject: course.startSubject, subjects: course.subjects },
      nextSubject: next,
      batch: batch ? { id: String(batch._id), name: batch.name, currentSubject: batch.currentSubject } : null,
      joinable,
      validityOver,
      validity: { validTill: enrollment.validTill, leftDays: Math.max(0, Math.ceil((new Date(enrollment.validTill) - now) / (1000*60*60*24))) },
      session: liveWindowSession ? { id:String(liveWindowSession._id), startAt: liveWindowSession.startAt, endAt: liveWindowSession.endAt, joinUrl: liveWindowSession.joinUrl } : null,
      sessions: sessions.map(s => ({ id:String(s._id), startAt:s.startAt, endAt:s.endAt, joinUrl:s.joinUrl, recordingUrl:s.recordingUrl }))
    };

    return res.json(resp);
  } catch (e) {
    console.error('next-step error', e);
    return res.status(500).json({ success:false, message:e.message });
  }
});

router.get('/batch/sessions', authMiddleware, async (req, res) => {
  try {
    const subject = req.query.subject;
    const batchId = req.query.batchId || null;
    const q = {};
    if (subject) q.subject = subject;
    if (batchId) q.batchId = batchId;
    const sessions = await Session.find(q).sort({ startAt: 1 }).limit(20);
    res.json({ success:true, items: sessions });
  } catch (e) {
    res.status(500).json({ success:false, message:e.message });
  }
});

router.patch('/progress/:id', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending','done'];
    if (!allowed.includes(status)) return res.status(400).json({ success:false, message:'Invalid status' });
    const item = await SubjectProgress.findByIdAndUpdate(req.params.id, { status }, { new:true });
    res.json({ success:true, item });
  } catch (e) {
    res.status(500).json({ success:false, message:e.message });
  }
});

module.exports = router;
