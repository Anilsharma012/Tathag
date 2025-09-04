const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authMiddleware } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware"); // ✅ multer middleware

// ✅ Profile Image Upload Route
router.post(
  "/upload-profile",
  authMiddleware,                 // token verification
  upload.single("profilePic"),   // multer handles file upload
  userController.uploadProfilePic // controller to process and return URL
);

// Other routes
router.post("/update-details", authMiddleware, userController.updateDetails);
router.post("/save-category", authMiddleware, userController.saveCategory);
router.post("/save-exam", authMiddleware, userController.saveExam);
router.get("/auto-login", authMiddleware, userController.autoLogin);
router.get("/verify-token", userController.verifyToken);
router.post("/student/enroll/:courseId", authMiddleware, userController.enrollInCourse);

router.put("/student/unlock/:courseId", authMiddleware, userController.unlockCourseForStudent);
router.get("/student/my-courses", authMiddleware,userController.getUnlockedCourses);
// router.put("/student/unlock/:courseId", authMiddleware, userController.unlockCourseForStudent);
router.post("/payment/create-order", authMiddleware, userController.createOrder);
router.post("/payment/verify-and-unlock", authMiddleware, userController.verifyAndUnlockPayment);
router.get("/payment/history", authMiddleware, userController.getPaymentHistory);
router.get("/receipts", authMiddleware, userController.getUserReceipts);
router.get("/receipt/:receiptId/download", authMiddleware, userController.downloadReceipt);


router.get("/test-populate", async (req, res) => {
  try {
    const user = await User.findById("PASTE_YOUR_USER_ID_HERE").populate("enrolledCourses.courseId");
    res.json(user.enrolledCourses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



module.exports = router;
