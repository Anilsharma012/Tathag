const express = require("express");
const router = express.Router();
const {
  getUserProgress,
  updateLessonProgress,
  getResumeLesson,
  startLesson,
  getCourseProgressSummary,
} = require("../controllers/UserProgressController");

// Import auth middleware
const { authMiddleware } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(authMiddleware);

// Get user progress for a specific course
router.get("/course/:courseId", getUserProgress);

// Get resume lesson for a course
router.get("/course/:courseId/resume", getResumeLesson);

// Get course progress summary
router.get("/course/:courseId/summary", getCourseProgressSummary);

// Update lesson progress
router.post("/course/:courseId/lesson", updateLessonProgress);

// Start a lesson (mark as accessed)
router.post("/course/:courseId/start-lesson", startLesson);

module.exports = router;
