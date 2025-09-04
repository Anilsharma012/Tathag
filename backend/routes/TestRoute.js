const express = require("express");
const router = express.Router();

const {
  createTest,
  getTestsByTopic,
  updateTest,
  deleteTest
} = require("../controllers/TestController");


const { authMiddleware } = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/permissionMiddleware");

// console.log("✅ authMiddleware:", typeof authMiddleware);
// console.log("✅ checkPermission:", typeof checkPermission);

// 🔐 Create Test
router.post("/", authMiddleware, checkPermission("test_create"), createTest);

// 📘 Get all tests of a topic
router.get("/:topicId", authMiddleware, checkPermission("test_read"), getTestsByTopic);

// ✏️ Update test
router.put("/:id", authMiddleware, checkPermission("test_update"), updateTest);

// ❌ Delete test
router.delete("/:id", authMiddleware, checkPermission("test_delete"), deleteTest);

module.exports = router;
