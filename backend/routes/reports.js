const express = require('express');
const router = express.Router();
const { authMiddleware, adminAuth } = require('../middleware/authMiddleware');
const Response = require('../models/test/Response');
const Test = require('../models/course/Test');

router.get('/tests/reports', authMiddleware, async (req, res) => {
  try {
    const role = req.user?.role || 'student';
    if (role === 'student') {
      const rows = await Response.find({ user: req.user.id }).populate('test', 'title').sort({ createdAt: -1 }).limit(100);
      const items = rows.map(r => ({
        testId: r.test?._id,
        testName: r.test?.title || 'Test',
        date: r.createdAt,
        score: r.totalScore || 0,
        accuracy: calcAccuracy(r),
        timeTaken: null,
        status: 'Completed'
      }));
      return res.json({ success:true, items });
    }

    // admin view - aggregate by test
    const agg = await Response.aggregate([
      { $group: { _id: '$test', attempts: { $sum: 1 }, avgScore: { $avg: '$totalScore' }, maxScore: { $max: '$totalScore' }, minScore: { $min: '$totalScore' } } },
      { $sort: { attempts: -1 } },
      { $limit: 200 }
    ]);
    const tests = await Test.find({ _id: { $in: agg.map(a => a._id) } }).select('title');
    const testMap = Object.fromEntries(tests.map(t => [t._id.toString(), t.title]));
    const items = agg.map(a => ({
      testId: a._id,
      testName: testMap[a._id?.toString()] || 'Test',
      attempts: a.attempts,
      avgScore: Math.round((a.avgScore || 0) * 100) / 100,
      highest: a.maxScore || 0,
      lowest: a.minScore || 0
    }));
    res.json({ success:true, items });
  } catch (e) {
    res.status(500).json({ success:false, message:e.message });
  }
});

function calcAccuracy(r){
  const total = (r.answers || []).length;
  if (!total) return 0;
  const correct = (r.answers || []).filter(a => a.isCorrect).length;
  return Math.round((correct/total)*100);
}

module.exports = router;
