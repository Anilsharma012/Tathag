const Discussion = require('../models/Discussion');
const DiscussionReply = require('../models/DiscussionReply');

// Get all discussions for admin moderation
const getAllDiscussions = async (req, res) => {
  try {
    console.log('🛡️ Admin fetching all discussions');
    const { page = 1, limit = 10, status, category, search } = req.query;

    const filter = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (category && category !== 'all') {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const discussions = await Discussion.find(filter)
      .populate('askedBy', 'name email')
      .populate('moderatedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Discussion.countDocuments(filter);

    // Get counts for dashboard
    const statusCounts = await Discussion.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log(`✅ Found ${discussions.length} discussions for admin`);
    res.status(200).json({
      success: true,
      discussions,
      statusCounts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Error fetching discussions for admin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch discussions',
      error: error.message
    });
  }
};

// Moderate discussion (approve/reject/publish)
const moderateDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, moderationNote } = req.body; // action: 'approve', 'reject', 'publish', 'unpublish'
    const adminId = req.user.id;

    console.log(`🛡️ Moderating discussion ${id} with action: ${action}`);

    const discussion = await Discussion.findById(id);
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    switch (action) {
      case 'approve':
        discussion.status = 'approved';
        discussion.isPublished = true;
        break;
      case 'reject':
        discussion.status = 'rejected';
        discussion.isPublished = false;
        break;
      case 'publish':
        discussion.isPublished = true;
        if (discussion.status === 'pending') {
          discussion.status = 'approved';
        }
        break;
      case 'unpublish':
        discussion.isPublished = false;
        break;
      case 'pin':
        discussion.isPinned = true;
        break;
      case 'unpin':
        discussion.isPinned = false;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
    }

    discussion.moderatedBy = adminId;
    discussion.moderationNote = moderationNote || '';
    discussion.moderatedAt = new Date();

    await discussion.save();

    console.log('✅ Discussion moderated successfully');
    res.status(200).json({
      success: true,
      message: `Discussion ${action}ed successfully`,
      discussion
    });
  } catch (error) {
    console.error('❌ Error moderating discussion:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to moderate discussion',
      error: error.message
    });
  }
};

// Delete discussion
const deleteDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Deleting discussion: ${id}`);

    const discussion = await Discussion.findById(id);
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    // Delete all replies first
    await DiscussionReply.deleteMany({ discussionId: id });
    
    // Delete the discussion
    await Discussion.findByIdAndDelete(id);

    console.log('✅ Discussion and its replies deleted successfully');
    res.status(200).json({
      success: true,
      message: 'Discussion deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting discussion:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete discussion',
      error: error.message
    });
  }
};

// Get all replies for admin moderation
const getAllReplies = async (req, res) => {
  try {
    console.log('🛡️ Admin fetching all replies');
    const { page = 1, limit = 10, status, discussionId } = req.query;

    const filter = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (discussionId) {
      filter.discussionId = discussionId;
    }

    const replies = await DiscussionReply.find(filter)
      .populate('repliedBy', 'name email')
      .populate('discussionId', 'title')
      .populate('moderatedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await DiscussionReply.countDocuments(filter);

    console.log(`✅ Found ${replies.length} replies for admin`);
    res.status(200).json({
      success: true,
      replies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Error fetching replies for admin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch replies',
      error: error.message
    });
  }
};

// Moderate reply
const moderateReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, moderationNote } = req.body;
    const adminId = req.user.id;

    console.log(`🛡️ Moderating reply ${id} with action: ${action}`);

    const reply = await DiscussionReply.findById(id);
    if (!reply) {
      return res.status(404).json({
        success: false,
        message: 'Reply not found'
      });
    }

    switch (action) {
      case 'approve':
        reply.status = 'approved';
        reply.isPublished = true;
        break;
      case 'reject':
        reply.status = 'rejected';
        reply.isPublished = false;
        break;
      case 'mark_best':
        reply.isBestAnswer = true;
        break;
      case 'unmark_best':
        reply.isBestAnswer = false;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
    }

    reply.moderatedBy = adminId;
    reply.moderationNote = moderationNote || '';
    reply.moderatedAt = new Date();

    await reply.save();

    console.log('✅ Reply moderated successfully');
    res.status(200).json({
      success: true,
      message: `Reply ${action}ed successfully`,
      reply
    });
  } catch (error) {
    console.error('❌ Error moderating reply:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to moderate reply',
      error: error.message
    });
  }
};

// Delete reply
const deleteReply = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Deleting reply: ${id}`);

    const reply = await DiscussionReply.findById(id);
    if (!reply) {
      return res.status(404).json({
        success: false,
        message: 'Reply not found'
      });
    }

    // Remove reply from discussion
    await Discussion.findByIdAndUpdate(
      reply.discussionId,
      { $pull: { replies: id } }
    );

    // Delete the reply
    await DiscussionReply.findByIdAndDelete(id);

    console.log('✅ Reply deleted successfully');
    res.status(200).json({
      success: true,
      message: 'Reply deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting reply:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete reply',
      error: error.message
    });
  }
};

// Get discussion statistics
const getDiscussionStats = async (req, res) => {
  try {
    console.log('📊 Fetching discussion statistics');

    const totalDiscussions = await Discussion.countDocuments();
    const pendingDiscussions = await Discussion.countDocuments({ status: 'pending' });
    const approvedDiscussions = await Discussion.countDocuments({ status: 'approved' });
    const publishedDiscussions = await Discussion.countDocuments({ isPublished: true });
    
    const totalReplies = await DiscussionReply.countDocuments();
    const pendingReplies = await DiscussionReply.countDocuments({ status: 'pending' });
    
    const categoryStats = await Discussion.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const monthlyStats = await Discussion.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    console.log('✅ Discussion statistics fetched');
    res.status(200).json({
      success: true,
      stats: {
        total: totalDiscussions,
        pending: pendingDiscussions,
        approved: approvedDiscussions,
        published: publishedDiscussions,
        totalReplies,
        pendingReplies,
        categoryStats,
        monthlyStats
      }
    });
  } catch (error) {
    console.error('❌ Error fetching discussion stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch discussion statistics',
      error: error.message
    });
  }
};

module.exports = {
  getAllDiscussions,
  moderateDiscussion,
  deleteDiscussion,
  getAllReplies,
  moderateReply,
  deleteReply,
  getDiscussionStats
};
