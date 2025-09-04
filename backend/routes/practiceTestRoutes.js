const express = require("express");
const router = express.Router();

const practiceTestController = require("../controllers/PracticeTestController");
const practiceQuestionController = require("../controllers/PracticeQuestionController");
const studentPracticeResponseController = require("../controllers/StudentPracticeResponseController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/permissionMiddleware");

// ==================== ADMIN ROUTES ====================

// Practice Test Management
router.post("/admin/create",
  authMiddleware,
  checkPermission("admin"),
  practiceTestController.createPracticeTest
);

router.get("/admin/all",
  authMiddleware,
  checkPermission("admin"),
  practiceTestController.getAllPracticeTests
);

router.get("/admin/:id",
  authMiddleware,
  checkPermission("admin"),
  practiceTestController.getPracticeTestById
);

router.put("/admin/:id",
  authMiddleware,
  checkPermission("admin"),
  practiceTestController.updatePracticeTest
);

router.delete("/admin/:id",
  authMiddleware,
  checkPermission("admin"),
  practiceTestController.deletePracticeTest
);

router.put("/admin/:id/publish",
  authMiddleware,
  checkPermission("admin"),
  practiceTestController.publishPracticeTest
);

// Question Management
router.post("/admin/:practiceTestId/questions",
  authMiddleware,
  checkPermission("admin"),
  practiceQuestionController.addQuestionToPracticeTest
);

router.get("/admin/:practiceTestId/questions",
  authMiddleware,
  checkPermission("admin"),
  practiceQuestionController.getQuestionsByPracticeTest
);

router.post("/admin/:practiceTestId/questions/bulk",
  authMiddleware,
  checkPermission("admin"),
  practiceQuestionController.bulkUploadQuestions
);

router.put("/admin/questions/:id",
  authMiddleware,
  checkPermission("admin"),
  practiceQuestionController.updateQuestion
);

router.delete("/admin/questions/:id",
  authMiddleware,
  checkPermission("admin"),
  practiceQuestionController.deleteQuestion
);

// ==================== STUDENT ROUTES ====================

// Practice Test Access
router.get("/student/published", 
  authMiddleware, 
  practiceTestController.getPublishedPracticeTests
);

router.get("/student/:id", 
  authMiddleware, 
  practiceTestController.getPracticeTestForStudent
);

router.get("/student/:practiceTestId/questions", 
  authMiddleware, 
  practiceQuestionController.getQuestionsForTest
);

// Test Taking
router.post("/student/:practiceTestId/start", 
  authMiddleware, 
  studentPracticeResponseController.startPracticeTest
);

router.put("/student/:practiceTestId/questions/:questionId/response", 
  authMiddleware, 
  studentPracticeResponseController.saveResponse
);

router.put("/student/:practiceTestId/switch-section", 
  authMiddleware, 
  studentPracticeResponseController.switchSection
);

router.post("/student/:practiceTestId/submit", 
  authMiddleware, 
  studentPracticeResponseController.submitTest
);

// Results and History
router.get("/student/:practiceTestId/result", 
  authMiddleware, 
  studentPracticeResponseController.getTestResult
);

router.get("/student/history", 
  authMiddleware, 
  studentPracticeResponseController.getStudentTestHistory
);

module.exports = router;
