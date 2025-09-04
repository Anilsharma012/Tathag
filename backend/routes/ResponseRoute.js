const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/permissionMiddleware");

const {
  submitTest,
  getUserResponses
} = require("../controllers/ResponseController");

 console.log("✅ authMiddleware:", typeof authMiddleware);
 console.log("✅ checkPermission:", typeof checkPermission);

// ✅ Submit a test attempt
router.post("/submit", authMiddleware, submitTest);

// ✅ Get student's previous attempts (optional)
router.get("/my-attempts", authMiddleware, getUserResponses);

module.exports = router;
