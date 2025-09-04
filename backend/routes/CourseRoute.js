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
