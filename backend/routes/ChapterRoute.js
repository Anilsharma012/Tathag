const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/permissionMiddleware");

const {
  createChapter,
  getChaptersBySubject,
  updateChapter,
  deleteChapter,
} = require("../controllers/ChapterController");

// console.log("✅ authMiddleware:", typeof authMiddleware);
// console.log("✅ checkPermission:", typeof checkPermission);

// 🔐 Create Chapter — needs permission
router.post("/", authMiddleware, checkPermission("chapter_create"), createChapter);

// 📘 Get all chapters of a subject
router.get("/:subjectId", authMiddleware, checkPermission("chapter_read"), getChaptersBySubject);

// ✏️ Update
router.put("/:id", authMiddleware, checkPermission("chapter_update"), updateChapter);

// ❌ Delete
router.delete("/:id", authMiddleware, checkPermission("chapter_delete"), deleteChapter);

module.exports = router;
