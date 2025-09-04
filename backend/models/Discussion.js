const mongoose = require('mongoose');

const discussionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['general', 'quantitative-aptitude', 'verbal-ability', 'data-interpretation', 'logical-reasoning', 'current-affairs', 'technical'],
    default: 'general'
  },
  tags: [{
    type: String,
    trim: true
  }],
  askedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'resolved'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  downvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DiscussionReply'
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
  resolvedAt: {
    type: Date
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for better query performance
discussionSchema.index({ askedBy: 1, createdAt: -1 });
discussionSchema.index({ status: 1, isPublished: 1 });
discussionSchema.index({ category: 1, createdAt: -1 });
discussionSchema.index({ tags: 1 });

// Virtual for reply count
discussionSchema.virtual('replyCount').get(function() {
  return this.replies.length;
});

// Virtual for upvote count
discussionSchema.virtual('upvoteCount').get(function() {
  return this.upvotes.length;
});

// Virtual for downvote count
discussionSchema.virtual('downvoteCount').get(function() {
  return this.downvotes.length;
});

module.exports = mongoose.model('Discussion', discussionSchema);
