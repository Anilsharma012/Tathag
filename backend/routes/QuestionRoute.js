const express = require("express");
const router = express.Router();

const {
  createQuestion,
  getQuestionsByTest,
  updateQuestion,
  deleteQuestion,
  
} = require("../controllers/QuestionController");

const { authMiddleware } = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/permissionMiddleware");


// console.log("✅ authMiddleware:", typeof authMiddleware);
// console.log("✅ checkPermission:", typeof checkPermission);

// ✅ Create question
router.post("/", authMiddleware, checkPermission("question_create"), createQuestion);

// ✅ Get questions of a test (query parameter format)
router.get("/", authMiddleware, checkPermission("question_read"), getQuestionsByTest);

// ✅ Get questions of a test (path parameter format - for backward compatibility)
router.get("/:testId", authMiddleware, checkPermission("question_read"), getQuestionsByTest);

// ✅ Update question
router.put("/:id",authMiddleware, checkPermission("question_update"), updateQuestion);

// ✅ Delete question
router.delete("/:id", authMiddleware, checkPermission("question_delete"), deleteQuestion);




module.exports = router;
