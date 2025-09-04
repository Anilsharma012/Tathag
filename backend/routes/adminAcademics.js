const express = require('express');
const router = express.Router();
const Course = require('../models/course/Course');
const Batch = require('../models/Batch');
const Session = require('../models/Session');
const Enrollment = require('../models/Enrollment');
const SubjectProgress = require('../models/SubjectProgress');
const User = require('../models/UserSchema');
const { adminAuth } = require('../middleware/authMiddleware');

// All endpoints require admin auth
router.use(adminAuth);

// Helper function to rotate subjects based on startSubject
const rotate = (arr, start) => {
  const i = Math.max(0, arr.findIndex(x => x === start));
  return arr.slice(i).concat(arr.slice(0, i));
};

// Helper function to calculate next subject for enrollment
const nextSubject = async (enrollment, course) => {
  const order = rotate((course.subjects && course.subjects.length ? course.subjects : ['A','B','C','D']), course.startSubject || 'A');
  const done = await SubjectProgress.find({ enrollmentId: enrollment._id, status: 'done' });
  const doneSet = new Set(done.map(d => d.subject));
  for (const s of order) { 
    if (!doneSet.has(s)) return s; 
  }
  return null; // all done
};

// GET /api/admin/academics/overview - Analytics overview
router.get('/overview', async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
    const startOfWeek = new Date(startOfDay.getTime() - (startOfDay.getDay() * 24 * 60 * 60 * 1000));
    const endOfWeek = new Date(startOfWeek.getTime() + (7 * 24 * 60 * 60 * 1000));
    const next30Days = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));

    // Live Today - sessions happening today
    const liveToday = await Session.countDocuments({
      startAt: { $gte: startOfDay, $lt: endOfDay }
    });

    // Classes This Week
    const classesThisWeek = await Session.countDocuments({
      startAt: { $gte: startOfWeek, $lt: endOfWeek }
    });

    // Subjects In Progress - count unique subjects being worked on
    const subjectsInProgress = await SubjectProgress.distinct('subject', { 
      status: 'pending' 
    });

    // Joinable Now - students who can join live right now
    const activeBatches = await Batch.find({}).populate('courseIds');
    let joinableNow = 0;
    
    for (const batch of activeBatches) {
      // Find students enrolled in courses attached to this batch
      const courseIds = batch.courseIds.map(c => c._id);
      const enrollments = await Enrollment.find({ 
        courseId: { $in: courseIds }, 
        status: 'active',
        validTill: { $gte: now }
      }).populate('courseId');

      for (const enrollment of enrollments) {
        const next = await nextSubject(enrollment, enrollment.courseId);
        if (next === batch.currentSubject) {
          // Check if there's a live session right now
          const liveSession = await Session.findOne({
            batchId: batch._id,
            subject: batch.currentSubject,
            startAt: { $lte: new Date(now.getTime() + 10*60*1000) }, // 10 min buffer
            endAt: { $gte: now }
          });
          if (liveSession) joinableNow++;
        }
      }
    }

    // Expiring Enrollments (30d)
    const expiringEnrollments = await Enrollment.countDocuments({
      status: 'active',
      validTill: { $gte: now, $lte: next30Days }
    });

    // Batch chips data
    const batches = await Batch.find({}).populate('courseIds', 'name');
    const batchChips = batches.map(batch => ({
      id: batch._id,
      name: batch.name,
      currentSubject: batch.currentSubject,
      coursesCount: batch.courseIds.length,
      courses: batch.courseIds.map(c => c.name).join(', ')
    }));

    res.json({
      success: true,
      kpis: {
        liveToday,
        classesThisWeek,
        subjectsInProgress: subjectsInProgress.length,
        joinableNow,
        expiringEnrollments
      },
      batchChips
    });

  } catch (error) {
    console.error('Overview error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/academics/batches - Batch management data
router.get('/batches', async (req, res) => {
  try {
    const { with: withParams } = req.query;
    const includeStats = withParams && withParams.includes('stats');
    const includeCourses = withParams && withParams.includes('courses');

    let batches = await Batch.find({});
    if (includeCourses) {
      batches = await Batch.find({}).populate('courseIds');
    }

    const courses = await Course.find({});
    
    let stats = {};
    if (includeStats) {
      // Calculate stats for each batch
      for (const batch of batches) {
        const courseIds = batch.courseIds || [];
        const enrollments = await Enrollment.find({ 
          courseId: { $in: courseIds },
          status: 'active'
        }).populate('courseId');

        // Count students in different states
        let joinLiveNow = 0;
        let backlogRecorded = 0;
        let completed = 0;

        for (const enrollment of enrollments) {
          const next = await nextSubject(enrollment, enrollment.courseId);
          if (!next) {
            completed++;
          } else if (next === batch.currentSubject) {
            joinLiveNow++;
          } else {
            backlogRecorded++;
          }
        }

        stats[batch._id] = {
          totalStudents: enrollments.length,
          joinLiveNow,
          backlogRecorded,
          completed
        };
      }
    }

    // Course-Subject Matrix
    const matrix = [];
    for (const course of courses) {
      const subjects = ['A', 'B', 'C', 'D'];
      const courseEnrollments = await Enrollment.find({ 
        courseId: course._id,
        status: 'active'
      });

      const row = {
        courseId: course._id,
        courseName: course.name,
        startSubject: course.startSubject || 'A',
        subjects: {}
      };

      for (const subject of subjects) {
        let done = 0;
        let pending = 0;

        for (const enrollment of courseEnrollments) {
          const progress = await SubjectProgress.findOne({
            enrollmentId: enrollment._id,
            subject
          });

          if (progress && progress.status === 'done') {
            done++;
          } else {
            const next = await nextSubject(enrollment, course);
            if (next === subject) {
              pending++;
            }
          }
        }

        // Get last session for this subject
        const lastSession = await Session.findOne({
          subject,
          batchId: { $in: batches.map(b => b._id) }
        }).sort({ startAt: -1 });

        row.subjects[subject] = {
          done,
          pending,
          total: courseEnrollments.length,
          status: done > 0 ? (pending > 0 ? 'in-progress' : 'done') : 'pending',
          lastSession: lastSession ? {
            startAt: lastSession.startAt,
            recordingUrl: lastSession.recordingUrl
          } : null
        };
      }

      matrix.push(row);
    }

    res.json({
      success: true,
      batches: batches.map(b => ({
        id: b._id,
        name: b.name,
        currentSubject: b.currentSubject,
        courseIds: b.courseIds,
        courses: includeCourses ? b.courseIds : undefined
      })),
      courses,
      matrix,
      stats
    });

  } catch (error) {
    console.error('Batches error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/admin/academics/batches/:id/current-subject - Advance subject
router.patch('/batches/:id/current-subject', async (req, res) => {
  try {
    const { id } = req.params;
    const { currentSubject } = req.body;

    if (!['A', 'B', 'C', 'D'].includes(currentSubject)) {
      return res.status(400).json({ success: false, message: 'Invalid subject' });
    }

    const batch = await Batch.findByIdAndUpdate(
      id, 
      { currentSubject }, 
      { new: true }
    ).populate('courseIds');

    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    res.json({ success: true, batch });

  } catch (error) {
    console.error('Advance subject error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/admin/academics/progress/bulk-done - Mark subjects done for multiple students
router.patch('/progress/bulk-done', async (req, res) => {
  try {
    const { enrollmentIds, subject } = req.body;

    if (!enrollmentIds || !Array.isArray(enrollmentIds) || !subject) {
      return res.status(400).json({ 
        success: false, 
        message: 'enrollmentIds array and subject are required' 
      });
    }

    if (!['A', 'B', 'C', 'D'].includes(subject)) {
      return res.status(400).json({ success: false, message: 'Invalid subject' });
    }

    // Update or create progress records
    const bulkOps = enrollmentIds.map(enrollmentId => ({
      updateOne: {
        filter: { enrollmentId, subject },
        update: { $set: { status: 'done' } },
        upsert: true
      }
    }));

    const result = await SubjectProgress.bulkWrite(bulkOps);

    res.json({ 
      success: true, 
      modified: result.modifiedCount,
      upserted: result.upsertedCount
    });

  } catch (error) {
    console.error('Bulk mark done error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/academics/students/:batchId - Get students for a batch with queue info
router.get('/students/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;

    const batch = await Batch.findById(batchId).populate('courseIds');
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    const courseIds = batch.courseIds.map(c => c._id);
    const enrollments = await Enrollment.find({ 
      courseId: { $in: courseIds },
      status: 'active'
    }).populate(['courseId', 'userId']);

    const students = [];
    const now = new Date();

    for (const enrollment of enrollments) {
      const user = enrollment.userId;
      const course = enrollment.courseId;
      const next = await nextSubject(enrollment, course);
      const validityLeft = Math.max(0, Math.ceil((new Date(enrollment.validTill) - now) / (1000 * 60 * 60 * 24)));

      let queue = 'completed';
      if (next) {
        queue = next === batch.currentSubject ? 'joinLiveNow' : 'backlogRecorded';
      }

      students.push({
        enrollmentId: enrollment._id,
        userId: user._id,
        name: user.name,
        email: user.email,
        avatar: user.profilePic || null,
        course: {
          id: course._id,
          name: course.name
        },
        nextSubject: next,
        validityLeft,
        queue,
        joinedAt: enrollment.joinedAt
      });
    }

    // Group by queue
    const queues = {
      joinLiveNow: students.filter(s => s.queue === 'joinLiveNow'),
      backlogRecorded: students.filter(s => s.queue === 'backlogRecorded'),
      completed: students.filter(s => s.queue === 'completed')
    };

    res.json({ success: true, students, queues, batch });

  } catch (error) {
    console.error('Students error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/admin/academics/courses/:courseId/start-subject - Change course start subject
router.patch('/courses/:courseId/start-subject', async (req, res) => {
  try {
    const { courseId } = req.params;
    const { startSubject } = req.body;

    if (!['A', 'B', 'C', 'D'].includes(startSubject)) {
      return res.status(400).json({ success: false, message: 'Invalid start subject' });
    }

    const course = await Course.findByIdAndUpdate(
      courseId,
      { startSubject },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    res.json({ success: true, course });

  } catch (error) {
    console.error('Change start subject error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/admin/academics/batches/:batchId/courses - Attach/detach courses
router.patch('/batches/:batchId/courses', async (req, res) => {
  try {
    const { batchId } = req.params;
    const { courseIds, action = 'set' } = req.body; // action: 'set', 'add', 'remove'

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    let newCourseIds = [...(batch.courseIds || [])];

    if (action === 'set') {
      newCourseIds = courseIds || [];
    } else if (action === 'add') {
      const toAdd = courseIds.filter(id => !newCourseIds.some(existing => existing.toString() === id.toString()));
      newCourseIds.push(...toAdd);
    } else if (action === 'remove') {
      newCourseIds = newCourseIds.filter(id => !courseIds.includes(id.toString()));
    }

    const updatedBatch = await Batch.findByIdAndUpdate(
      batchId,
      { courseIds: newCourseIds },
      { new: true }
    ).populate('courseIds');

    res.json({ success: true, batch: updatedBatch });

  } catch (error) {
    console.error('Batch courses error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
