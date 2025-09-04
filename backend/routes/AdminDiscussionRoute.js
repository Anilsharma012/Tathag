const express = require('express');
const router = express.Router();
const {
  getAllDiscussions,
  moderateDiscussion,
  deleteDiscussion,
  getAllReplies,
  moderateReply,
  deleteReply,
  getDiscussionStats
} = require('../controllers/AdminDiscussionController');
const { adminAuth } = require('../middleware/authMiddleware');

// Admin routes for discussion moderation
router.get('/discussions', adminAuth, getAllDiscussions);
router.get('/discussions/stats', adminAuth, getDiscussionStats);
router.put('/discussions/:id/moderate', adminAuth, moderateDiscussion);
router.delete('/discussions/:id', adminAuth, deleteDiscussion);

router.get('/replies', adminAuth, getAllReplies);
router.put('/replies/:id/moderate', adminAuth, moderateReply);
router.delete('/replies/:id', adminAuth, deleteReply);

module.exports = router;
