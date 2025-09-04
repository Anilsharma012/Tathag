const express = require("express");
const router = express.Router();
const {
  getStudentCourseSubjects,
  getStudentSubjectChapters,
  getStudentChapterTopics,
  getStudentTopicTests,
  getStudentCourseStructure
} = require("../controllers/StudentCourseController");

// Import auth middleware (regular student auth, not admin)
const { authMiddleware } = require("../middleware/authMiddleware");

// All routes require student authentication
router.use(authMiddleware);

// Get complete course structure (optimized single call)
router.get("/course/:courseId/structure", getStudentCourseStructure);

// Get subjects for a course
router.get("/course/:courseId/subjects", getStudentCourseSubjects);

// Get chapters for a subject
router.get("/subject/:subjectId/chapters", getStudentSubjectChapters);

// Get topics for a chapter
router.get("/chapter/:chapterId/topics", getStudentChapterTopics);

// Get tests for a topic
router.get("/topic/:topicId/tests", getStudentTopicTests);

module.exports = router;
