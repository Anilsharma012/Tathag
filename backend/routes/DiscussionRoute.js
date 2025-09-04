const express = require('express');
const router = express.Router();
const {
  createDiscussion,
  getPublishedDiscussions,
  getDiscussionById,
  addReply,
  voteDiscussion,
  getUserDiscussions
} = require('../controllers/DiscussionController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Student routes for discussions
router.post('/create', authMiddleware, createDiscussion);
router.get('/published', getPublishedDiscussions);
router.get('/my-discussions', authMiddleware, getUserDiscussions);
router.get('/:id', getDiscussionById);
router.post('/:discussionId/reply', authMiddleware, addReply);
router.post('/:id/vote', authMiddleware, voteDiscussion);

module.exports = router;
