const express = require('express');
const router = express.Router();
const {
  upload,
  uploadStudyMaterial,
  getAllStudyMaterials,
  getStudentStudyMaterials,
  downloadStudyMaterial,
  updateStudyMaterial,
  deleteStudyMaterial,
  getStudyMaterialById
} = require('../controllers/StudyMaterialController');

const { authMiddleware } = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/permissionMiddleware');

// Student routes (with optional auth for testing)
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

router.get('/student', optionalAuth, getStudentStudyMaterials);
router.get('/download/:id', authMiddleware, downloadStudyMaterial);
router.get('/student/:id', optionalAuth, getStudyMaterialById);

// Admin routes (protected by auth and admin permission)
router.post('/admin/upload', 
  authMiddleware, 
  checkPermission(['admin', 'sub-admin']), 
  upload.single('file'), 
  uploadStudyMaterial
);

router.get('/admin', 
  authMiddleware, 
  checkPermission(['admin', 'sub-admin']), 
  getAllStudyMaterials
);

router.get('/admin/:id', 
  authMiddleware, 
  checkPermission(['admin', 'sub-admin']), 
  getStudyMaterialById
);

router.put('/admin/:id', 
  authMiddleware, 
  checkPermission(['admin', 'sub-admin']), 
  updateStudyMaterial
);

router.delete('/admin/:id', 
  authMiddleware, 
  checkPermission(['admin', 'sub-admin']), 
  deleteStudyMaterial
);

module.exports = router;
