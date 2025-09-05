const express = require('express');
const router = express.Router();
const ensureSubjectUnlocked = require('../middleware/ensureSubjectUnlocked');

// Sample content route guarded by unlock middleware
router.get('/courses/:courseId/batches/:batchId/subjects/:subjectId/lessons', ensureSubjectUnlocked, async (req, res) => {
  // Return a static sample set to demonstrate the guard
  const { subjectId } = req.params;
  return res.json({
    success: true,
    subjectId,
    lessons: [
      { id: 'l1', title: 'Introduction', type: 'video' },
      { id: 'l2', title: 'Practice Set 1', type: 'test' }
    ]
  });
});

module.exports = router;
