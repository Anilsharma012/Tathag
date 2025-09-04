const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxLength: 2000
  },
  type: {
    type: String,
    required: true,
    enum: ['important', 'update', 'reminder', 'general', 'maintenance'],
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  targetAudience: {
    type: String,
    enum: ['all', 'students', 'teachers', 'admins'],
    default: 'all'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  expiryDate: {
    type: Date,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  attachments: [{
    fileName: String,
    filePath: String,
    fileSize: String
  }],
  readBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  viewCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
announcementSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for formatted date
announcementSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
});

// Virtual for time ago
announcementSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes} minutes ago`;
    }
    return `${hours} hours ago`;
  } else if (days === 1) {
    return 'Yesterday';
  } else if (days < 7) {
    return `${days} days ago`;
  } else {
    return this.formattedDate;
  }
});

// Instance method to mark as read by user
announcementSchema.methods.markAsRead = function(userId) {
  // Check if user has already read this announcement
  const existingRead = this.readBy.find(read => read.userId.toString() === userId.toString());
  
  if (!existingRead) {
    this.readBy.push({ userId });
    this.viewCount += 1;
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Instance method to check if user has read this announcement
announcementSchema.methods.isReadBy = function(userId) {
  return this.readBy.some(read => read.userId.toString() === userId.toString());
};

// Static method to get active announcements
announcementSchema.statics.getActiveAnnouncements = function(filters = {}) {
  const query = { 
    isActive: true,
    $or: [
      { expiryDate: null },
      { expiryDate: { $gt: new Date() } }
    ]
  };
  
  if (filters.type) {
    query.type = filters.type;
  }
  
  if (filters.targetAudience) {
    query.targetAudience = { $in: [filters.targetAudience, 'all'] };
  }
  
  if (filters.priority) {
    query.priority = filters.priority;
  }

  return this.find(query)
    .populate('createdBy', 'name email')
    .sort({ isPinned: -1, createdAt: -1 });
};

// Static method to get announcements for students
announcementSchema.statics.getStudentAnnouncements = function(userId = null) {
  const query = {
    isActive: true,
    targetAudience: { $in: ['all', 'students'] },
    $or: [
      { expiryDate: null },
      { expiryDate: { $gt: new Date() } }
    ]
  };

  return this.find(query)
    .populate('createdBy', 'name')
    .sort({ isPinned: -1, createdAt: -1 })
    .select('-readBy'); // Don't send readBy array to frontend for performance
};

const Announcement = mongoose.model('Announcement', announcementSchema);

module.exports = Announcement;
