const mongoose = require('mongoose');

const mockTestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Mock test title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [300, 'Description cannot exceed 300 characters']
  },
  seriesId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MockTestSeries',
    required: true
  },
  testNumber: {
    type: Number,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Test duration is required'],
    min: [1, 'Duration must be at least 1 minute']
  },
  totalQuestions: {
    type: Number,
    default: 0
  },
  totalMarks: {
    type: Number,
    default: 0
  },
  sections: [{
    name: {
      type: String,
      required: true,
      enum: ['VARC', 'DILR', 'QA'] // Verbal Ability & Reading Comprehension, Data Interpretation & Logical Reasoning, Quantitative Ability
    },
    duration: {
      type: Number, // in minutes
      required: true
    },
    totalQuestions: {
      type: Number,
      required: true
    },
    totalMarks: {
      type: Number,
      required: true
    },
    questions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MockTestQuestion'
    }]
  }],
  instructions: {
    general: [{
      type: String
    }],
    sectionSpecific: {
      VARC: [String],
      DILR: [String],
      QA: [String]
    }
  },
  isFree: {
    type: Boolean,
    default: false
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
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  publishedAt: {
    type: Date
  },
  attemptedBy: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    attemptedAt: {
      type: Date,
      default: Date.now
    },
    completed: {
      type: Boolean,
      default: false
    },
    score: {
      type: Number,
      default: 0
    },
    timeTaken: {
      type: Number, // in minutes
      default: 0
    }
  }]
}, {
  timestamps: true
});

// Index for better query performance
mockTestSchema.index({ seriesId: 1, testNumber: 1 });
mockTestSchema.index({ isActive: 1, isPublished: 1 });
mockTestSchema.index({ createdBy: 1 });

// Virtual for attempt count
mockTestSchema.virtual('attemptCount').get(function() {
  return this.attemptedBy.length;
});

module.exports = mongoose.model('MockTest', mockTestSchema);
