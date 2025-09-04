const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const {checkPermission}=require("../middleware/permissionMiddleware")

const {
  createSubject,
  getSubjectsByCourse,
  updateSubject,
  deleteSubject,
  bulkAddSubjects
} = require("../controllers/SubjectController");



// const { verifyToken } = require("../Middleware/authMiddleware");
// const { checkPermission } = require("../Middleware/permissionMiddleware");

// console.log("🧪 verifyToken:", typeof verifyToken);
// console.log("🧪 checkPermission:", typeof checkPermission);



router.post("/", authMiddleware, checkPermission("subject_create"), createSubject);
router.get("/:courseId", authMiddleware, checkPermission("subject_read"), getSubjectsByCourse);
router.put("/:id", authMiddleware, checkPermission("subject_update"), updateSubject);
router.delete("/:id", authMiddleware, checkPermission("subject_delete"), deleteSubject);
router.post(
  "/bulk",
  authMiddleware,
  checkPermission("subject_create"),
  bulkAddSubjects
);



module.exports = router;
