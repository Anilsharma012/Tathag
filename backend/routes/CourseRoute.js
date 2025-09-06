const express = require("express");
const router = express.Router();
const {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  toggleLock,
  togglePublish,
  getPublishedCourses,
  getPublishedCourseById
} = require("../controllers/CourseController");

const mongoose = require('mongoose');
const slugify = require('slugify');
const Course = require('../models/course/Course');
const Subject = require('../models/course/Subject');
const Chapter = require('../models/course/Chapter');
const Topic = require('../models/course/Topic');
const Test = require('../models/course/Test');

// ✅ Auth & Permission Middleware
const { authMiddleware } = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/permissionMiddleware");

// ✅ Multer setup
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// ✅ CREATE course with thumbnail
router.post(
  "/",
  authMiddleware,
  checkPermission("course_create"),
  upload.single("thumbnail"),
  createCourse
);

// ✅ PUBLIC routes first (before parameter routes that can match anything)
// ✅ GET published courses for student LMS (no auth needed)
router.get("/student/published-courses", getPublishedCourses);
router.get("/student/published-courses/:id", getPublishedCourseById);

// ✅ Batch-wise subject view (public, user optional)
const Course = require('../models/course/Course');
const Subject = require('../models/course/Subject');
const Batch = require('../models/Batch');
const UserProgress = require('../models/UserProgress');

router.get('/:courseId/batches/:batchId/view', async (req, res) => {
  try {
    const { courseId, batchId } = req.params;

    const course = await Course.findById(courseId).select('_id name title');
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const batch = await Batch.findById(batchId);
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });

    // Validate course association
    const isLinkedToCourse = (batch.courseId && String(batch.courseId) === String(courseId)) ||
      (Array.isArray(batch.courseIds) && batch.courseIds.map(String).includes(String(courseId)));
    if (!isLinkedToCourse) {
      return res.status(400).json({ success: false, message: 'Batch not linked to this course' });
    }

    // Apply schedule: set activeSubjectId to the latest subject whose time has arrived
    if (Array.isArray(batch.schedule) && batch.schedule.length > 0) {
      const now = new Date();
      const eligible = batch.schedule
        .filter(s => !s.openAt || new Date(s.openAt) <= now)
        .sort((a, b) => new Date(a.openAt || 0) - new Date(b.openAt || 0));
      if (eligible.length > 0) {
        const latest = eligible[eligible.length - 1];
        if (!batch.activeSubjectId || String(batch.activeSubjectId) !== String(latest.subjectId)) {
          batch.activeSubjectId = latest.subjectId;
          await batch.save();
        }
      }
    }

    // Compute next unlock time
    let nextOpenAt = null;
    if (Array.isArray(batch.schedule)) {
      const now = new Date();
      const upcoming = batch.schedule
        .filter(s => s.openAt && new Date(s.openAt) > now)
        .sort((a, b) => new Date(a.openAt) - new Date(b.openAt));
      if (upcoming.length > 0) nextOpenAt = upcoming[0].openAt;
    }

    const subjects = await Subject.find({ courseId }).sort({ order: 1, name: 1 }).select('_id name order');

    // Optional per-user completion badge (best-effort)
    let completedSubjectIds = new Set();
    try {
      if (req.user && req.user.id) {
        const up = await UserProgress.findOne({ userId: req.user.id, courseId }).select('lessonProgress');
        // Without a canonical lesson-subject map, we cannot compute exact completion; leave empty set
      }
    } catch (e) {
      // ignore
    }

    const subjectViews = subjects.map(s => {
      const isUnlocked = batch.activeSubjectId && String(s._id) === String(batch.activeSubjectId);
      const status = isUnlocked ? 'open' : (completedSubjectIds.has(String(s._id)) ? 'completed' : 'locked');
      return { _id: s._id, name: s.name, order: s.order, isUnlocked, status };
    });

    return res.json({ success: true, course, batch: {
      _id: batch._id,
      name: batch.name,
      courseId: batch.courseId || null,
      activeSubjectId: batch.activeSubjectId || null,
      schedule: batch.schedule || []
    }, subjects: subjectViews, nextOpenAt });
  } catch (error) {
    console.error('View course error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ READ all courses or by ID (ADMIN - after public routes)
router.get("/", authMiddleware, checkPermission("course_read"), getCourses);

router.get(
  "/:id",
  authMiddleware,
  checkPermission("course_read"),
  getCourseById
);

// ✅ UPDATE course with optional thumbnail
router.put(
  "/:id",
  authMiddleware,
  checkPermission("course_update"),
  upload.single("thumbnail"),
  updateCourse
);

// ✅ DELETE course
router.delete(
  "/:id",
  authMiddleware,
  checkPermission("course_delete"),
  deleteCourse
);

// ✅ TOGGLE lock/unlock
router.put(
  "/toggle-lock/:id",
  authMiddleware,
  checkPermission("course_update"),
  toggleLock
);

// ✅ TOGGLE publish/unpublish
router.put(
  "/toggle-publish/:id",
  authMiddleware,
  checkPermission("course_update"),
  togglePublish
);

module.exports = router;
