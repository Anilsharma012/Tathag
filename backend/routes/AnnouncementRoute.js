const express = require('express');
const router = express.Router();
const {
  upload,
  createAnnouncement,
  getAllAnnouncements,
  getStudentAnnouncements,
  markAsRead,
  updateAnnouncement,
  deleteAnnouncement,
  getAnnouncementById,
  getAnnouncementStats
} = require('../controllers/AnnouncementController');

const { authMiddleware } = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/permissionMiddleware');

// Optional auth middleware for students (allows non-logged users to view public announcements)
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.header("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      if (token && token !== 'null' && token !== 'undefined') {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test_secret_key_for_development');
        req.user = decoded;
      }
    }
    next();
  } catch (error) {
    console.log('⚠️ Optional auth failed, proceeding without user:', error.message);
    next();
  }
};

// Public routes (for students)
router.get('/student', optionalAuth, getStudentAnnouncements);
router.get('/student/:id', optionalAuth, getAnnouncementById);

// Student authenticated routes
router.post('/mark-read/:id', authMiddleware, markAsRead);

// Admin routes (protected by auth and admin permission)
router.post('/admin', 
  authMiddleware, 
  checkPermission(['admin', 'sub-admin']), 
  upload.array('attachments', 5), 
  createAnnouncement
);

router.get('/admin', 
  authMiddleware, 
  checkPermission(['admin', 'sub-admin']), 
  getAllAnnouncements
);

router.get('/admin/stats', 
  authMiddleware, 
  checkPermission(['admin', 'sub-admin']), 
  getAnnouncementStats
);

router.get('/admin/:id', 
  authMiddleware, 
  checkPermission(['admin', 'sub-admin']), 
  getAnnouncementById
);

router.put('/admin/:id', 
  authMiddleware, 
  checkPermission(['admin', 'sub-admin']), 
  updateAnnouncement
);

router.delete('/admin/:id', 
  authMiddleware, 
  checkPermission(['admin', 'sub-admin']), 
  deleteAnnouncement
);

module.exports = router;
