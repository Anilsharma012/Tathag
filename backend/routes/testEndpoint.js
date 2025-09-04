const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');

// Simple test endpoint to verify auth
router.get('/auth-test', authMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Auth working',
    user: req.user
  });
});

module.exports = router;
