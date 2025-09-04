const express = require('express');
const router = express.Router();
const { authMiddleware, adminAuth, permitRoles, optionalAuth } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/LiveClassController');

// Public list with optional auth (falls back to demo student). Use query filters.
router.get('/', authMiddleware, ctrl.list);
router.get('/stats', adminAuth, ctrl.stats);
router.get('/version', ctrl.version);
router.get('/:id', authMiddleware, ctrl.get);

// Admin/Subadmin (teacher) create/update/delete
router.post('/', permitRoles('admin', 'subadmin'), ctrl.create);
router.put('/:id', permitRoles('admin', 'subadmin'), ctrl.update);
router.delete('/:id', permitRoles('admin'), ctrl.remove);
router.post('/:id/notify', permitRoles('admin', 'subadmin'), ctrl.notify);

module.exports = router;
