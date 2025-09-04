const express = require("express");
const router = express.Router();

const {
  createTopic,
  getTopicsByChapter,
  updateTopic,
  deleteTopic
} = require("../controllers/TopicController");

const { authMiddleware } = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/permissionMiddleware");

// console.log("✅ authMiddleware:", typeof authMiddleware);
// console.log("✅ checkPermission:", typeof checkPermission);

// 🔐 Create topic (admin or subadmin with permission)
router.post("/", authMiddleware, checkPermission("topic_create"), createTopic);

// 📘 Get all topics in a chapter
router.get("/:chapterId", authMiddleware, checkPermission("topic_read"), getTopicsByChapter);

// ✏️ Update topic
router.put("/:id", authMiddleware, checkPermission("topic_update"), updateTopic);

// ❌ Delete topic
router.delete("/:id", authMiddleware, checkPermission("topic_delete"), deleteTopic);

module.exports = router;
