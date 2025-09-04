const mongoose = require('mongoose');

const discussionReplySchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Reply content is required'],
    trim: true
  },
  discussionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Discussion',
    required: true
  },
  repliedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parentReply: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DiscussionReply',
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  isBestAnswer: {
    type: Boolean,
    default: false
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  downvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  moderationNote: {
    type: String,
    trim: true
  },
  moderatedAt: {
    type: Date
  },
  editedAt: {
    type: Date
  },
  isEdited: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for better query performance
discussionReplySchema.index({ discussionId: 1, createdAt: 1 });
discussionReplySchema.index({ repliedBy: 1, createdAt: -1 });
discussionReplySchema.index({ status: 1, isPublished: 1 });
discussionReplySchema.index({ parentReply: 1 });

// Virtual for upvote count
discussionReplySchema.virtual('upvoteCount').get(function() {
  return this.upvotes.length;
});

// Virtual for downvote count
discussionReplySchema.virtual('downvoteCount').get(function() {
  return this.downvotes.length;
});

module.exports = mongoose.model('DiscussionReply', discussionReplySchema);
