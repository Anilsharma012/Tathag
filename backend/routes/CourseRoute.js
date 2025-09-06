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

// Build normalized structure nodes for a course
async function buildStructure(courseId) {
  const subjects = await Subject.find({ courseId }).sort({ order: 1, name: 1 });
  const chaptersBySubject = await Chapter.find({ courseId }).sort({ order: 1, name: 1 });
  const topicsByChapter = await Topic.find({ course: courseId }).sort({ order: 1, name: 1 });

  const chaptersGrouped = chaptersBySubject.reduce((acc, ch) => {
    const k = String(ch.subjectId);
    (acc[k] = acc[k] || []).push(ch);
    return acc;
  }, {});
  const topicsGrouped = topicsByChapter.reduce((acc, t) => {
    const k = String(t.chapter);
    (acc[k] = acc[k] || []).push(t);
    return acc;
  }, {});

  const node = (doc, titleKey) => ({
    _id: doc._id,
    title: doc[titleKey],
    slug: slugify(String(doc[titleKey] || ''), { lower: true, strict: true }),
    order: doc.order || 0,
    children: []
  });

  const structure = subjects.map(s => {
    const sNode = node(s, 'name');
    const chapters = (chaptersGrouped[String(s._id)] || []).map(ch => {
      const chNode = node(ch, 'name');
      chNode.children = (topicsGrouped[String(ch._id)] || []).map(tp => node(tp, 'name'));
      return chNode;
    });
    sNode.children = chapters;
    return sNode;
  });
  return structure;
}

// GET /api/courses/:id/structure
router.get('/:id/structure', authMiddleware, checkPermission('course_read'), async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ success:false, message:'Course not found' });
    const structure = await buildStructure(id);
    res.json({ success:true, course:{ _id: course._id, name: course.name, title: course.title }, structure });
  } catch (e) {
    console.error('structure error:', e);
    res.status(500).json({ success:false, message: e.message });
  }
});

// POST /api/courses/copy-structure
router.post('/copy-structure', authMiddleware, checkPermission('course_update'), async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { sourceCourseId, targetCourseId, mode = 'MERGE', includeSectionalTests = true } = req.body;
    const dryRun = (req.query.dryRun === '1' || req.query.dryRun === 'true');
    if (!sourceCourseId || !targetCourseId) return res.status(400).json({ success:false, message:'sourceCourseId and targetCourseId are required' });
    if (String(sourceCourseId) === String(targetCourseId)) return res.status(400).json({ success:false, message:'Source and target cannot be same' });

    const source = await Course.findById(sourceCourseId);
    const target = await Course.findById(targetCourseId);
    if (!source || !target) return res.status(404).json({ success:false, message:'Course not found' });

    const srcStructure = await buildStructure(sourceCourseId);
    const tgtStructure = await buildStructure(targetCourseId);

    // Helper maps by slug
    const mapBySlug = (arr) => arr.reduce((m, n) => (m[n.slug] = n, m), {});

    let copiedSections = 0; // subjects + chapters
    let copiedLessons = 0; // topics
    let skipped = 0;

    // Fetch DB entities for target to upsert
    const tgtSubjectsDocs = await Subject.find({ courseId: targetCourseId });

    const subjectSlugToDoc = {};
    tgtSubjectsDocs.forEach(d => {
      subjectSlugToDoc[slugify(String(d.name || ''), { lower:true, strict:true })] = d;
    });

    for (const sNode of srcStructure) {
      // upsert subject by slug
      let subjectDoc = subjectSlugToDoc[sNode.slug];
      if (!subjectDoc) {
        copiedSections++;
        if (!dryRun) {
          subjectDoc = await Subject.create([{ courseId: targetCourseId, name: sNode.title, order: sNode.order }], { session });
          subjectDoc = subjectDoc[0];
        }
      } else {
        // update name/order if changed
        if (!dryRun && (subjectDoc.name !== sNode.title || (subjectDoc.order||0) !== (sNode.order||0))) {
          subjectDoc.name = sNode.title;
          subjectDoc.order = sNode.order || 0;
          await subjectDoc.save({ session });
        } else {
          skipped++;
        }
      }

      // chapters under subject
      const tgtChapters = await Chapter.find({ courseId: targetCourseId, subjectId: subjectDoc?._id || undefined }, null, { session });
      const chSlugMap = {};
      tgtChapters.forEach(c => chSlugMap[slugify(String(c.name||''), {lower:true, strict:true})] = c);

      for (const chNode of (sNode.children || [])) {
        let chDoc = chSlugMap[chNode.slug];
        if (!chDoc) {
          copiedSections++;
          if (!dryRun) {
            chDoc = await Chapter.create([{ courseId: targetCourseId, subjectId: subjectDoc._id, name: chNode.title, order: chNode.order }], { session });
            chDoc = chDoc[0];
          }
        } else {
          if (!dryRun && (chDoc.name !== chNode.title || (chDoc.order||0)!==(chNode.order||0))) {
            chDoc.name = chNode.title;
            chDoc.order = chNode.order || 0;
            await chDoc.save({ session });
          } else {
            skipped++;
          }
        }

        // topics as lessons
        const tgtTopics = await Topic.find({ course: targetCourseId, subject: subjectDoc?._id, chapter: chDoc?._id }, null, { session });
        const tpSlugMap = {};
        tgtTopics.forEach(t => tpSlugMap[slugify(String(t.name||''), {lower:true, strict:true})] = t);

        for (const tpNode of (chNode.children || [])) {
          let tpDoc = tpSlugMap[tpNode.slug];
          if (!tpDoc) {
            copiedLessons++;
            if (!dryRun) {
              tpDoc = await Topic.create([{ course: targetCourseId, subject: subjectDoc._id, chapter: chDoc._id, name: tpNode.title, order: tpNode.order }], { session });
              tpDoc = tpDoc[0];
            }
          } else {
            if (!dryRun && (tpDoc.name !== tpNode.title || (tpDoc.order||0)!==(tpNode.order||0))) {
              tpDoc.name = tpNode.title;
              tpDoc.order = tpNode.order || 0;
              await tpDoc.save({ session });
            } else {
              skipped++;
            }
          }

          if (!dryRun && includeSectionalTests) {
            // Best-effort: ensure at least a placeholder test exists per topic if any existed in source
            const srcTestsCount = await Test.countDocuments({ course: sourceCourseId, topic: tpDoc?._id });
            if (srcTestsCount > 0) {
              const tgtTests = await Test.find({ course: targetCourseId, topic: tpDoc._id });
              if (tgtTests.length === 0) {
                await Test.create([{ course: targetCourseId, subject: subjectDoc._id, chapter: chDoc._id, topic: tpDoc._id, title: `${tpNode.title} - Test`, duration: 30, totalMarks: 0 }], { session });
              }
            }
          }
        }
      }
    }

    if (mode === 'OVERWRITE' && !dryRun) {
      // Replace: remove any subject/chapters/topics in target not present by slug in source
      const srcSubjectSlugs = new Set(srcStructure.map(n => n.slug));
      const tgtSubjectsAll = await Subject.find({ courseId: targetCourseId }, null, { session });
      for (const s of tgtSubjectsAll) {
        const sSlug = slugify(String(s.name||''), {lower:true, strict:true});
        if (!srcSubjectSlugs.has(sSlug)) {
          await Topic.deleteMany({ course: targetCourseId, subject: s._id }, { session });
          await Chapter.deleteMany({ courseId: targetCourseId, subjectId: s._id }, { session });
          await Subject.deleteOne({ _id: s._id }, { session });
        }
      }
    }

    if (dryRun) {
      await session.abortTransaction();
      session.endSession();
      return res.json({ success:true, dryRun:true, copied:{ sections: copiedSections, lessons: copiedLessons }, skipped, mode });
    }

    await session.commitTransaction();
    session.endSession();

    res.json({ success:true, copied:{ sections: copiedSections, lessons: copiedLessons }, skipped, mode });
  } catch (e) {
    await session.abortTransaction();
    session.endSession();
    console.error('copy-structure error:', e);
    res.status(500).json({ success:false, message: e.message });
  }
});

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
