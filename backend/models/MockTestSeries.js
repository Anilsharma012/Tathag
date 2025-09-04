const mongoose = require('mongoose');

const mockTestSeriesSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Mock test series title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    enum: ['CAT', 'XAT', 'SNAP', 'NMAT', 'CMAT', 'MAT', 'GMAT', 'General'],
    default: 'CAT'
  },
  thumbnail: {
    type: String,
    default: null
  },
  totalTests: {
    type: Number,
    default: 0
  },
  freeTests: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    default: 0
  },
  validity: {
    type: Number, // in days
    default: 365
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard', 'Mixed'],
    default: 'Mixed'
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  publishedAt: {
    type: Date
  },
  enrolledStudents: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date
    }
  }]
}, {
  timestamps: true
});

// Index for better query performance
mockTestSeriesSchema.index({ category: 1, isPublished: 1 });
mockTestSeriesSchema.index({ createdBy: 1 });
mockTestSeriesSchema.index({ isActive: 1, isPublished: 1 });

// Virtual for enrolled students count
mockTestSeriesSchema.virtual('enrolledCount').get(function() {
  return this.enrolledStudents.length;
});

module.exports = mongoose.model('MockTestSeries', mockTestSeriesSchema);
