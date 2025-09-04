const Discussion = require('../models/Discussion');
const DiscussionReply = require('../models/DiscussionReply');
const User = require('../models/UserSchema');

// Create a new discussion/question
const createDiscussion = async (req, res) => {
  try {
    console.log('💬 Creating new discussion');
    const { title, content, category, tags } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    const discussion = new Discussion({
      title,
      content,
      category: category || 'general',
      tags: tags || [],
      askedBy: userId,
      status: 'pending',
      isPublished: false
    });

    await discussion.save();
    await discussion.populate('askedBy', 'name email');

    console.log('✅ Discussion created successfully:', discussion.title);
    res.status(201).json({
      success: true,
      message: 'Discussion created successfully. It will be published after admin approval.',
      discussion
    });
  } catch (error) {
    console.error('❌ Error creating discussion:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create discussion',
      error: error.message
    });
  }
};

// Get all published discussions for students
const getPublishedDiscussions = async (req, res) => {
  try {
    console.log('📚 Fetching published discussions');
    const { page = 1, limit = 10, category, search, sortBy = 'createdAt' } = req.query;

    const filter = { 
      status: 'approved', 
      isPublished: true 
    };

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const sortOption = {};
    switch (sortBy) {
      case 'popular':
        sortOption.views = -1;
        break;
      case 'upvotes':
        sortOption.upvotes = -1;
        break;
      case 'recent':
      default:
        sortOption.createdAt = -1;
        break;
    }

    const discussions = await Discussion.find(filter)
      .populate('askedBy', 'name email')
      .populate('moderatedBy', 'name')
      .populate({
        path: 'replies',
        populate: {
          path: 'repliedBy',
          select: 'name email'
        }
      })
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Discussion.countDocuments(filter);

    console.log(`✅ Found ${discussions.length} discussions`);
    res.status(200).json({
      success: true,
      discussions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Error fetching discussions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch discussions',
      error: error.message
    });
  }
};

// Get discussion by ID with replies
const getDiscussionById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Fetching discussion: ${id}`);

    const discussion = await Discussion.findById(id)
      .populate('askedBy', 'name email')
      .populate('moderatedBy', 'name')
      .populate({
        path: 'replies',
        populate: {
          path: 'repliedBy',
          select: 'name email'
        }
      });

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    // Increment views
    discussion.views += 1;
    await discussion.save();

    console.log('✅ Discussion found:', discussion.title);
    res.status(200).json({
      success: true,
      discussion
    });
  } catch (error) {
    console.error('❌ Error fetching discussion:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch discussion',
      error: error.message
    });
  }
};

// Add reply to discussion
const addReply = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const { content, parentReply } = req.body;
    const userId = req.user.id;

    console.log(`💬 Adding reply to discussion: ${discussionId}`);

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Reply content is required'
      });
    }

    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    const reply = new DiscussionReply({
      content,
      discussionId,
      repliedBy: userId,
      parentReply: parentReply || null,
      status: 'pending',
      isPublished: false
    });

    await reply.save();
    await reply.populate('repliedBy', 'name email');

    // Add reply to discussion
    discussion.replies.push(reply._id);
    await discussion.save();

    console.log('✅ Reply added successfully');
    res.status(201).json({
      success: true,
      message: 'Reply added successfully. It will be published after admin approval.',
      reply
    });
  } catch (error) {
    console.error('❌ Error adding reply:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add reply',
      error: error.message
    });
  }
};

// Vote on discussion (upvote/downvote)
const voteDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const { voteType } = req.body; // 'upvote' or 'downvote'
    const userId = req.user.id;

    console.log(`👍 Voting on discussion: ${id}, type: ${voteType}`);

    const discussion = await Discussion.findById(id);
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    // Remove existing votes by this user
    discussion.upvotes = discussion.upvotes.filter(vote => vote.toString() !== userId);
    discussion.downvotes = discussion.downvotes.filter(vote => vote.toString() !== userId);

    // Add new vote
    if (voteType === 'upvote') {
      discussion.upvotes.push(userId);
    } else if (voteType === 'downvote') {
      discussion.downvotes.push(userId);
    }

    await discussion.save();

    console.log('✅ Vote recorded successfully');
    res.status(200).json({
      success: true,
      message: 'Vote recorded successfully',
      upvotes: discussion.upvotes.length,
      downvotes: discussion.downvotes.length
    });
  } catch (error) {
    console.error('❌ Error voting on discussion:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record vote',
      error: error.message
    });
  }
};

// Get user's discussions
const getUserDiscussions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    console.log(`👤 Fetching discussions for user: ${userId}`);

    const discussions = await Discussion.find({ askedBy: userId })
      .populate('askedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Discussion.countDocuments({ askedBy: userId });

    console.log(`✅ Found ${discussions.length} user discussions`);
    res.status(200).json({
      success: true,
      discussions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Error fetching user discussions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user discussions',
      error: error.message
    });
  }
};

module.exports = {
  createDiscussion,
  getPublishedDiscussions,
  getDiscussionById,
  addReply,
  voteDiscussion,
  getUserDiscussions
};
