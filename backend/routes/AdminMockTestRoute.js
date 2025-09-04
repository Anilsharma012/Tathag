const express = require('express');
const router = express.Router();
const {
  createSeries,
  getAllSeries,
  createTest,
  createQuestion,
  getQuestions,
  toggleSeriesPublication,
  toggleTestPublication,
  getTestAnalytics
} = require('../controllers/AdminMockTestController');
const { adminAuth } = require('../middleware/authMiddleware');

// Admin routes for mock test management
router.post('/series', adminAuth, createSeries);
router.get('/series', adminAuth, getAllSeries);
router.put('/series/:seriesId/publish', adminAuth, toggleSeriesPublication);

router.post('/test', adminAuth, createTest);
router.put('/test/:testId/publish', adminAuth, toggleTestPublication);
router.get('/test/:testId/analytics', adminAuth, getTestAnalytics);

router.post('/question', adminAuth, createQuestion);
router.get('/questions', adminAuth, getQuestions);

module.exports = router;
