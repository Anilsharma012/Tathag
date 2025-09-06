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
const Question = require('../models/course/Question');
const crypto = require('crypto');

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

// Utility: canonical JSON + hash and counts for verify/dry-run
async function computeCanonical(courseId, includeSectionalTests) {
  const subjects = await Subject.find({ courseId }).sort({ order: 1, name: 1 });
  const chapters = await Chapter.find({ courseId }).sort({ order: 1, name: 1 });
  const topics = await Topic.find({ course: courseId }).sort({ order: 1, name: 1 });
  let tests = [];
  if (includeSectionalTests) {
    tests = await Test.find({ course: courseId }).sort({ title: 1 });
  }

  const sById = new Map(subjects.map(d => [String(d._id), d]));
  const chById = new Map(chapters.map(d => [String(d._id), d]));

  const canonical = [];
  const bySlug = (txt) => slugify(String(txt || ''), { lower: true, strict: true });

  // Build subject -> chapters -> topics (with tests summary)
  for (const s of subjects) {
    const sSlug = bySlug(s.name);
    const sNode = { t: 'subject', slug: sSlug, title: s.name, order: s.order || 0, children: [] };
    const chOfS = chapters.filter(ch => String(ch.subjectId) === String(s._id));
    for (const ch of chOfS) {
      const chSlug = bySlug(ch.name);
      const chNode = { t: 'chapter', slug: chSlug, title: ch.name, order: ch.order || 0, children: [] };
      const tpOfCh = topics.filter(tp => String(tp.chapter) === String(ch._id));
      for (const tp of tpOfCh) {
        const tpSlug = bySlug(tp.name);
        const tpNode = { t: 'topic', slug: tpSlug, title: tp.name, order: tp.order || 0, tests: [] };
        if (includeSectionalTests) {
          const testsOfTp = tests.filter(ts => String(ts.topic) === String(tp._id));
          tpNode.tests = testsOfTp.map(ts => ({ slug: bySlug(ts.title), title: ts.title, duration: ts.duration || 0, totalMarks: ts.totalMarks || 0 })).sort((a,b)=>a.slug.localeCompare(b.slug));
        }
        chNode.children.push(tpNode);
      }
      chNode.children.sort((a,b)=>a.order - b.order || a.slug.localeCompare(b.slug));
      sNode.children.push(chNode);
    }
    sNode.children.sort((a,b)=>a.order - b.order || a.slug.localeCompare(b.slug));
    canonical.push(sNode);
  }
  canonical.sort((a,b)=>a.order - b.order || a.slug.localeCompare(b.slug));

  const counts = {
    sections: subjects.length + chapters.length,
    lessons: topics.length,
    quizzes: includeSectionalTests ? tests.length : 0,
    assets: 0
  };
  const json = JSON.stringify(canonical);
  const hash = crypto.createHash('sha256').update(json).digest('hex');
  return { canonical, hash, counts };
}

// Utility: build copy tasks from source
async function buildCopyTasks(sourceCourseId, includeSectionalTests) {
  const bySlug = (txt) => slugify(String(txt || ''), { lower: true, strict: true });
  const subjects = await Subject.find({ courseId: sourceCourseId }).sort({ order: 1, name: 1 });
  const chapters = await Chapter.find({ courseId: sourceCourseId }).sort({ order: 1, name: 1 });
  const topics = await Topic.find({ course: sourceCourseId }).sort({ order: 1, name: 1 });
  let tests = [];
  let questionsByTest = new Map();
  if (includeSectionalTests) {
    tests = await Test.find({ course: sourceCourseId }).sort({ title: 1 });
    const testIds = tests.map(t => t._id);
    const questions = await Question.find({ testId: { $in: testIds } }).sort({ order: 1, createdAt: 1 });
    questionsByTest = questions.reduce((acc, q) => {
      const k = String(q.testId);
      if (!acc.has(k)) acc.set(k, []);
      acc.get(k).push(q);
      return acc;
    }, new Map());
  }

  const tasks = [];
  const subjSlugById = new Map();
  const chSlugById = new Map();

  for (const s of subjects) {
    const sSlug = bySlug(s.name);
    subjSlugById.set(String(s._id), sSlug);
    tasks.push({ type: 'subject', key: `${sourceCourseId}:${sSlug}`, data: { title: s.name, order: s.order || 0, slug: sSlug } });
  }
  for (const ch of chapters) {
    const sSlug = subjSlugById.get(String(ch.subjectId));
    const chSlug = bySlug(ch.name);
    chSlugById.set(String(ch._id), chSlug);
    tasks.push({ type: 'chapter', key: `${sourceCourseId}:${sSlug}/${chSlug}`, data: { title: ch.name, order: ch.order || 0, slug: chSlug, subjectSlug: sSlug } });
  }
  for (const tp of topics) {
    const sSlug = subjSlugById.get(String(tp.subject));
    const chSlug = chSlugById.get(String(tp.chapter));
    const tpSlug = bySlug(tp.name);
    tasks.push({ type: 'topic', key: `${sourceCourseId}:${sSlug}/${chSlug}/${tpSlug}`, data: { title: tp.name, order: tp.order || 0, slug: tpSlug, subjectSlug: sSlug, chapterSlug: chSlug } });
  }
  if (includeSectionalTests) {
    for (const ts of tests) {
      const topic = topics.find(t => String(t._id) === String(ts.topic));
      if (!topic) continue;
      const sSlug = subjSlugById.get(String(topic.subject));
      const chSlug = chSlugById.get(String(topic.chapter));
      const tpSlug = bySlug(topic.name);
      const tsSlug = bySlug(ts.title);
      const key = `${sourceCourseId}:${sSlug}/${chSlug}/${tpSlug}:${tsSlug}`;
      tasks.push({ type: 'test', key, data: { title: ts.title, duration: ts.duration || 0, totalMarks: ts.totalMarks || 0, slug: tsSlug, subjectSlug: sSlug, chapterSlug: chSlug, topicSlug: tpSlug } });
      const qs = questionsByTest.get(String(ts._id)) || [];
      for (const q of qs) {
        const qKey = `${key}:q:${crypto.createHash('sha1').update(String(q.questionText || '')).digest('hex')}`;
        tasks.push({ type: 'question', key: qKey, data: { questionText: q.questionText, direction: q.direction || '', options: q.options || [], correctOptionIndex: q.correctOptionIndex, marks: q.marks || 3, negativeMarks: q.negativeMarks || 1, explanation: q.explanation || '', type: q.type || 'MCQ', order: q.order || 0, parent: { subjectSlug: sSlug, chapterSlug: chSlug, topicSlug: tpSlug, testSlug: tsSlug } } });
      }
    }
  }
  return tasks;
}

// Upsert helpers (idempotent by composite slug path)
async function upsertSubject(targetCourseId, payload, session) {
  const { title, order, slug } = payload;
  const existing = await Subject.findOne({ courseId: targetCourseId, name: new RegExp(`^${title}$`, 'i') }).session(session);
  if (existing) {
    let changed = false;
    if ((existing.order || 0) !== (order || 0)) { existing.order = order || 0; changed = true; }
    if (changed) await existing.save({ session });
    return { doc: existing, created: false };
  }
  const doc = await Subject.create([{ courseId: targetCourseId, name: title, order: order || 0 }], { session });
  return { doc: doc[0], created: true };
}
async function upsertChapter(targetCourseId, payload, session) {
  const { title, order, slug, subjectSlug } = payload;
  const bySlug = (txt) => slugify(String(txt || ''), { lower: true, strict: true });
  const subjects = await Subject.find({ courseId: targetCourseId }).session(session);
  const subj = subjects.find(s => bySlug(s.name) === subjectSlug);
  if (!subj) throw new Error(`Missing subject for chapter: ${subjectSlug}`);
  const existing = await Chapter.findOne({ courseId: targetCourseId, subjectId: subj._id, name: new RegExp(`^${title}$`, 'i') }).session(session);
  if (existing) {
    let changed = false;
    if ((existing.order || 0) !== (order || 0)) { existing.order = order || 0; changed = true; }
    if (changed) await existing.save({ session });
    return { doc: existing, created: false, subject: subj };
  }
  const doc = await Chapter.create([{ courseId: targetCourseId, subjectId: subj._id, name: title, order: order || 0 }], { session });
  return { doc: doc[0], created: true, subject: subj };
}
async function upsertTopic(targetCourseId, payload, session) {
  const { title, order, slug, subjectSlug, chapterSlug } = payload;
  const bySlug = (txt) => slugify(String(txt || ''), { lower: true, strict: true });
  const subjects = await Subject.find({ courseId: targetCourseId }).session(session);
  const subj = subjects.find(s => bySlug(s.name) === subjectSlug);
  if (!subj) throw new Error(`Missing subject for topic: ${subjectSlug}`);
  const chapters = await Chapter.find({ courseId: targetCourseId, subjectId: subj._id }).session(session);
  const ch = chapters.find(c => bySlug(c.name) === chapterSlug);
  if (!ch) throw new Error(`Missing chapter for topic: ${subjectSlug}/${chapterSlug}`);
  const existing = await Topic.findOne({ course: targetCourseId, subject: subj._id, chapter: ch._id, name: new RegExp(`^${title}$`, 'i') }).session(session);
  if (existing) {
    let changed = false;
    if ((existing.order || 0) !== (order || 0)) { existing.order = order || 0; changed = true; }
    if (changed) await existing.save({ session });
    return { doc: existing, created: false, subject: subj, chapter: ch };
  }
  const doc = await Topic.create([{ course: targetCourseId, subject: subj._id, chapter: ch._id, name: title, order: order || 0 }], { session });
  return { doc: doc[0], created: true, subject: subj, chapter: ch };
}
async function upsertTest(targetCourseId, payload, session) {
  const { title, duration, totalMarks, subjectSlug, chapterSlug, topicSlug } = payload;
  const bySlug = (txt) => slugify(String(txt || ''), { lower: true, strict: true });
  const subjects = await Subject.find({ courseId: targetCourseId }).session(session);
  const subj = subjects.find(s => bySlug(s.name) === subjectSlug);
  if (!subj) throw new Error(`Missing subject for test: ${subjectSlug}`);
  const chapters = await Chapter.find({ courseId: targetCourseId, subjectId: subj._id }).session(session);
  const ch = chapters.find(c => bySlug(c.name) === chapterSlug);
  if (!ch) throw new Error(`Missing chapter for test: ${subjectSlug}/${chapterSlug}`);
  const topics = await Topic.find({ course: targetCourseId, subject: subj._id, chapter: ch._id }).session(session);
  const tp = topics.find(t => bySlug(t.name) === topicSlug);
  if (!tp) throw new Error(`Missing topic for test: ${subjectSlug}/${chapterSlug}/${topicSlug}`);
  const existing = await Test.findOne({ course: targetCourseId, subject: subj._id, chapter: ch._id, topic: tp._id, title: new RegExp(`^${title}$`, 'i') }).session(session);
  if (existing) {
    let changed = false;
    if ((existing.duration || 0) !== (duration || 0)) { existing.duration = duration || 0; changed = true; }
    if ((existing.totalMarks || 0) !== (totalMarks || 0)) { existing.totalMarks = totalMarks || 0; changed = true; }
    if (changed) await existing.save({ session });
    return { doc: existing, created: false, subject: subj, chapter: ch, topic: tp };
  }
  const doc = await Test.create([{ course: targetCourseId, subject: subj._id, chapter: ch._id, topic: tp._id, title, duration: duration || 0, totalMarks: totalMarks || 0 }], { session });
  return { doc: doc[0], created: true, subject: subj, chapter: ch, topic: tp };
}

async function mergeQuestionsToTest(targetTestId, sourceQuestionPayloads, session) {
  const existingQs = await Question.find({ testId: targetTestId }).session(session);
  const existingByText = new Map(existingQs.map(q => [String(q.questionText || ''), q]));
  let created = 0, updated = 0;
  for (const q of sourceQuestionPayloads) {
    const found = existingByText.get(String(q.questionText || ''));
    if (found) {
      let changed = false;
      if ((found.order || 0) !== (q.order || 0)) { found.order = q.order || 0; changed = true; }
      if (changed) await found.save({ session });
      updated += changed ? 1 : 0;
    } else {
      await Question.create([{ testId: targetTestId, questionText: q.questionText, direction: q.direction || '', options: q.options || [], correctOptionIndex: q.correctOptionIndex, marks: q.marks || 3, negativeMarks: q.negativeMarks || 1, explanation: q.explanation || '', type: q.type || 'MCQ', order: q.order || 0 }], { session });
      created += 1;
    }
  }
  return { created, updated };
}

// Execute tasks in batches with retries
async function executeBatches(targetCourseId, tasks, plan, mode, includeSectionalTests) {
  const results = { copied: { subjects: 0, chapters: 0, topics: 0, tests: 0, questions: 0 }, skipped: 0, errors: [], batches: { processed: 0, total: Math.ceil(tasks.length / plan.batchSize) } };
  const backoffBase = 500;

  for (let i = 0; i < tasks.length; i += plan.batchSize) {
    const batch = tasks.slice(i, i + plan.batchSize);
    let attempts = 0;
    // transaction per batch
    const session = await mongoose.startSession();
    try {
      while (true) {
        attempts++;
        try {
          session.startTransaction();
          for (const t of batch) {
            try {
              if (t.type === 'subject') {
                const { created } = await upsertSubject(targetCourseId, t.data, session);
                results.copied.subjects += created ? 1 : 0;
                if (!created) results.skipped += 1;
              } else if (t.type === 'chapter') {
                const { created } = await upsertChapter(targetCourseId, t.data, session);
                results.copied.chapters += created ? 1 : 0;
                if (!created) results.skipped += 1;
              } else if (t.type === 'topic') {
                const { created } = await upsertTopic(targetCourseId, t.data, session);
                results.copied.topics += created ? 1 : 0;
                if (!created) results.skipped += 1;
              } else if (t.type === 'test') {
                const { created, doc } = await upsertTest(targetCourseId, t.data, session);
                results.copied.tests += created ? 1 : 0;
                if (!created) results.skipped += 1;
              } else if (t.type === 'question') {
                // For questions, merge based on text uniqueness
                const parent = t.data.parent;
                const { doc: testDoc } = await upsertTest(targetCourseId, { title: parent.testSlug, duration: t.data.duration || 0, totalMarks: t.data.totalMarks || 0, subjectSlug: parent.subjectSlug, chapterSlug: parent.chapterSlug, topicSlug: parent.topicSlug }, session);
                const { created } = await (async () => {
                  const existing = await Question.findOne({ testId: testDoc._id, questionText: t.data.questionText }).session(session);
                  if (existing) {
                    // update minimal fields
                    let changed = false;
                    if ((existing.order || 0) !== (t.data.order || 0)) { existing.order = t.data.order || 0; changed = true; }
                    if (changed) await existing.save({ session });
                    return { created: false };
                  }
                  await Question.create([{ testId: testDoc._id, questionText: t.data.questionText, direction: t.data.direction || '', options: t.data.options || [], correctOptionIndex: t.data.correctOptionIndex, marks: t.data.marks || 3, negativeMarks: t.data.negativeMarks || 1, explanation: t.data.explanation || '', type: t.data.type || 'MCQ', order: t.data.order || 0 }], { session });
                  return { created: true };
                })();
                results.copied.questions += created ? 1 : 0;
                if (!created) results.skipped += 1;
              }
            } catch (itemErr) {
              results.errors.push({ key: t.key, message: itemErr.message || String(itemErr) });
            }
          }
          await session.commitTransaction();
          break; // batch success
        } catch (batchErr) {
          await session.abortTransaction();
          if (attempts > plan.retries) {
            results.errors.push({ key: `batch_${i / plan.batchSize}`, message: batchErr.message || String(batchErr) });
            break;
          }
          await new Promise(r => setTimeout(r, backoffBase * (attempts === 1 ? 1 : 3)));
        }
      }
    } finally {
      session.endSession();
      results.batches.processed += 1;
    }
  }

  // OVERWRITE: cleanup extras not in source after all batches
  if (mode === 'OVERWRITE') {
    const bySlug = (txt) => slugify(String(txt || ''), { lower: true, strict: true });
    const src = await computeCanonical(targetCourseId, includeSectionalTests); // current target after merge-upserts
    // We need the source slugs from tasks for subjects/chapters/topics/tests
    const subjectSlugs = new Set(tasks.filter(t=>t.type==='subject').map(t=>t.data.slug));
    const chapterSlugsBySubject = tasks.filter(t=>t.type==='chapter').reduce((m,t)=>{ const k=t.data.subjectSlug; (m[k]=m[k]||new Set()).add(t.data.slug); return m; },{});
    const topicSlugsByPath = tasks.filter(t=>t.type==='topic').reduce((m,t)=>{ const k=`${t.data.subjectSlug}/${t.data.chapterSlug}`; (m[k]=m[k]||new Set()).add(t.data.slug); return m; },{});

    // Delete subjects not in source slugs
    const tgtSubjectsAll = await Subject.find({ courseId: targetCourseId });
    for (const s of tgtSubjectsAll) {
      const sSlug = bySlug(s.name);
      if (!subjectSlugs.has(sSlug)) {
        const chs = await Chapter.find({ courseId: targetCourseId, subjectId: s._id });
        for (const ch of chs) {
          const tps = await Topic.find({ course: targetCourseId, subject: s._id, chapter: ch._id });
          for (const tp of tps) {
            const tests = await Test.find({ course: targetCourseId, subject: s._id, chapter: ch._id, topic: tp._id });
            const testIds = tests.map(t=>t._id);
            await Question.deleteMany({ testId: { $in: testIds } });
            await Test.deleteMany({ _id: { $in: testIds } });
          }
          await Topic.deleteMany({ course: targetCourseId, subject: s._id, chapter: ch._id });
        }
        await Chapter.deleteMany({ courseId: targetCourseId, subjectId: s._id });
        await Subject.deleteOne({ _id: s._id });
      }
    }
    // Delete chapters not in source per subject
    for (const s of await Subject.find({ courseId: targetCourseId })) {
      const sSlug = bySlug(s.name);
      const allowedChSlugs = chapterSlugsBySubject[sSlug] || new Set();
      const chs = await Chapter.find({ courseId: targetCourseId, subjectId: s._id });
      for (const ch of chs) {
        const chSlug = bySlug(ch.name);
        if (!allowedChSlugs.has(chSlug)) {
          const tps = await Topic.find({ course: targetCourseId, subject: s._id, chapter: ch._id });
          for (const tp of tps) {
            const tests = await Test.find({ course: targetCourseId, subject: s._id, chapter: ch._id, topic: tp._id });
            const testIds = tests.map(t=>t._id);
            await Question.deleteMany({ testId: { $in: testIds } });
            await Test.deleteMany({ _id: { $in: testIds } });
          }
          await Topic.deleteMany({ course: targetCourseId, subject: s._id, chapter: ch._id });
          await Chapter.deleteOne({ _id: ch._id });
        }
      }
    }
    // Delete topics not in source per subject/chapter
    for (const s of await Subject.find({ courseId: targetCourseId })) {
      const sSlug = bySlug(s.name);
      const chs = await Chapter.find({ courseId: targetCourseId, subjectId: s._id });
      for (const ch of chs) {
        const chSlug = bySlug(ch.name);
        const allowedTpSlugs = topicSlugsByPath[`${sSlug}/${chSlug}`] || new Set();
        const tps = await Topic.find({ course: targetCourseId, subject: s._id, chapter: ch._id });
        for (const tp of tps) {
          const tpSlug = bySlug(tp.name);
          if (!allowedTpSlugs.has(tpSlug)) {
            const tests = await Test.find({ course: targetCourseId, subject: s._id, chapter: ch._id, topic: tp._id });
            const testIds = tests.map(t=>t._id);
            await Question.deleteMany({ testId: { $in: testIds } });
            await Test.deleteMany({ _id: { $in: testIds } });
            await Topic.deleteOne({ _id: tp._id });
          }
        }
      }
    }
  }

  return results;
}

// Verification + Reconcile loop
async function verifyAndReconcile(sourceCourseId, targetCourseId, includeSectionalTests, maxCycles) {
  for (let attempt = 1; attempt <= maxCycles; attempt++) {
    const src = await computeCanonical(sourceCourseId, includeSectionalTests);
    const tgt = await computeCanonical(targetCourseId, includeSectionalTests);

    // Check that all source paths exist in target (subset match)
    const listPaths = (canon) => {
      const paths = new Set();
      for (const s of canon.canonical) {
        const pS = s.slug;
        paths.add(pS);
        for (const ch of s.children) {
          const pCh = `${pS}/${ch.slug}`;
          paths.add(pCh);
          for (const tp of ch.children) {
            const pTp = `${pCh}/${tp.slug}`;
            paths.add(pTp);
            for (const ts of (tp.tests || [])) {
              paths.add(`${pTp}:${ts.slug}`);
            }
          }
        }
      }
      return paths;
    };
    const srcPaths = listPaths(src);
    const tgtPaths = listPaths(tgt);

    let missing = [];
    for (const p of srcPaths) if (!tgtPaths.has(p)) missing.push(p);

    if (missing.length === 0) {
      return { matched: true, attempts: attempt, source: src, target: tgt };
    }

    // Reconcile: run a merge copy pass limited to missing is complex; we run full merge idempotently
    const tasks = await buildCopyTasks(sourceCourseId, includeSectionalTests);
    await executeBatches(targetCourseId, tasks, { batchSize: 50, retries: 2 }, 'MERGE', includeSectionalTests);
  }
  const src = await computeCanonical(sourceCourseId, includeSectionalTests);
  const tgt = await computeCanonical(targetCourseId, includeSectionalTests);
  return { matched: false, attempts: maxCycles, source: src, target: tgt };
}

// Snapshot + rollback helpers for OVERWRITE
async function snapshotTarget(targetCourseId) {
  const subjects = await Subject.find({ courseId: targetCourseId });
  const chapters = await Chapter.find({ courseId: targetCourseId });
  const topics = await Topic.find({ course: targetCourseId });
  const tests = await Test.find({ course: targetCourseId });
  const testIds = tests.map(t=>t._id);
  const questions = await Question.find({ testId: { $in: testIds } });
  return { subjects, chapters, topics, tests, questions };
}
async function restoreSnapshot(targetCourseId, snap) {
  // Clear current
  const testsNow = await Test.find({ course: targetCourseId });
  const testIdsNow = testsNow.map(t=>t._id);
  await Question.deleteMany({ testId: { $in: testIdsNow } });
  await Test.deleteMany({ course: targetCourseId });
  await Topic.deleteMany({ course: targetCourseId });
  await Chapter.deleteMany({ courseId: targetCourseId });
  await Subject.deleteMany({ courseId: targetCourseId });
  // Restore with original _id
  if (snap.subjects.length) await Subject.insertMany(snap.subjects.map(d=>d.toObject ? d.toObject() : d));
  if (snap.chapters.length) await Chapter.insertMany(snap.chapters.map(d=>d.toObject ? d.toObject() : d));
  if (snap.topics.length) await Topic.insertMany(snap.topics.map(d=>d.toObject ? d.toObject() : d));
  if (snap.tests.length) await Test.insertMany(snap.tests.map(d=>d.toObject ? d.toObject() : d));
  if (snap.questions.length) await Question.insertMany(snap.questions.map(d=>d.toObject ? d.toObject() : d));
}

// POST /api/courses/copy-structure (enhanced)
router.post('/copy-structure', authMiddleware, checkPermission('course_update'), async (req, res) => {
  try {
    const { sourceCourseId, targetCourseId, mode = 'MERGE', includeSectionalTests = true, plan: planIn } = req.body;
    const dryRun = (req.query.dryRun === '1' || req.query.dryRun === 'true');

    if (!sourceCourseId || !targetCourseId) return res.status(400).json({ success:false, message:'sourceCourseId and targetCourseId are required' });
    if (String(sourceCourseId) === String(targetCourseId)) return res.status(400).json({ success:false, message:'Source and target cannot be same' });
    if (!['MERGE','OVERWRITE','merge','overwrite'].includes(mode)) return res.status(400).json({ success:false, message:'Invalid mode' });

    const source = await Course.findById(sourceCourseId);
    const target = await Course.findById(targetCourseId);
    if (!source || !target) return res.status(404).json({ success:false, message:'Course not found' });

    const plan = { batchSize: Math.min(Math.max((planIn && planIn.batchSize) || 50, 1), 200), retries: Math.min(Math.max((planIn && planIn.retries) || 2, 0), 5) };

    // Dry-run summary
    const srcCanon = await computeCanonical(sourceCourseId, includeSectionalTests);
    const tgtCanon = await computeCanonical(targetCourseId, includeSectionalTests);
    const tasks = await buildCopyTasks(sourceCourseId, includeSectionalTests);

    if (dryRun) {
      return res.json({ success: true, dryRun: true, source: { counts: srcCanon.counts, hash: srcCanon.hash }, target: { counts: tgtCanon.counts, hash: tgtCanon.hash }, plan: { totalItems: tasks.length, totalBatches: Math.ceil(tasks.length / plan.batchSize), batchSize: plan.batchSize, retries: plan.retries }, mode: (mode||'MERGE').toUpperCase() });
    }

    let snapshot = null;
    if ((mode||'MERGE').toUpperCase() === 'OVERWRITE') {
      snapshot = await snapshotTarget(targetCourseId);
    }

    // Execute batches
    const execRes = await executeBatches(targetCourseId, tasks, plan, (mode||'MERGE').toUpperCase(), includeSectionalTests);

    // Verify & reconcile up to 3 passes
    const verify = await verifyAndReconcile(sourceCourseId, targetCourseId, includeSectionalTests, 3);

    if (!verify.matched && (mode||'MERGE').toUpperCase() === 'OVERWRITE') {
      await restoreSnapshot(targetCourseId, snapshot);
    }

    const incomplete = !verify.matched || execRes.errors.length > 0;

    return res.json({ success: verify.matched, incomplete, copied: { sections: execRes.copied.subjects + execRes.copied.chapters, lessons: execRes.copied.topics, quizzes: execRes.copied.tests, questions: execRes.copied.questions }, skipped: execRes.skipped, batches: execRes.batches, verify: { matched: verify.matched, attempts: verify.attempts, sourceHash: verify.source.hash, targetHash: verify.target.hash, sourceCounts: verify.source.counts, targetCounts: verify.target.counts }, errors: execRes.errors, mode: (mode||'MERGE').toUpperCase() });
  } catch (e) {
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
