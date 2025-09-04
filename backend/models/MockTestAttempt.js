const mongoose = require('mongoose');

const mockTestAttemptSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MockTest',
    required: true
  },
  seriesId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MockTestSeries',
    required: true
  },
  startTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  totalDuration: {
    type: Number, // in minutes
    required: true
  },
  timeSpent: {
    type: Number, // in minutes
    default: 0
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  isSubmitted: {
    type: Boolean,
    default: false
  },
  currentSection: {
    type: String,
    enum: ['VARC', 'DILR', 'QA'],
    default: 'VARC'
  },
  sectionProgress: {
    VARC: {
      timeSpent: { type: Number, default: 0 },
      questionsAttempted: { type: Number, default: 0 },
      questionsAnswered: { type: Number, default: 0 },
      isCompleted: { type: Boolean, default: false }
    },
    DILR: {
      timeSpent: { type: Number, default: 0 },
      questionsAttempted: { type: Number, default: 0 },
      questionsAnswered: { type: Number, default: 0 },
      isCompleted: { type: Boolean, default: false }
    },
    QA: {
      timeSpent: { type: Number, default: 0 },
      questionsAttempted: { type: Number, default: 0 },
      questionsAnswered: { type: Number, default: 0 },
      isCompleted: { type: Boolean, default: false }
    }
  },
  responses: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MockTestQuestion',
      required: true
    },
    selectedAnswer: {
      type: mongoose.Schema.Types.Mixed // Can be string, number, or array
    },
    isAnswered: {
      type: Boolean,
      default: false
    },
    isMarkedForReview: {
      type: Boolean,
      default: false
    },
    isVisited: {
      type: Boolean,
      default: false
    },
    timeSpent: {
      type: Number, // in seconds
      default: 0
    },
    answeredAt: {
      type: Date
    }
  }],
  score: {
    total: { type: Number, default: 0 },
    VARC: { type: Number, default: 0 },
    DILR: { type: Number, default: 0 },
    QA: { type: Number, default: 0 }
  },
  marks: {
    total: { type: Number, default: 0 },
    positive: { type: Number, default: 0 },
    negative: { type: Number, default: 0 }
  },
  percentile: {
    overall: { type: Number, default: 0 },
    VARC: { type: Number, default: 0 },
    DILR: { type: Number, default: 0 },
    QA: { type: Number, default: 0 }
  },
  rank: {
    type: Number,
    default: 0
  },
  analysis: {
    accuracy: { type: Number, default: 0 },
    speed: { type: Number, default: 0 }, // questions per minute
    strengths: [String],
    weaknesses: [String]
  }
}, {
  timestamps: true
});

// Index for better query performance
mockTestAttemptSchema.index({ studentId: 1, testId: 1 });
mockTestAttemptSchema.index({ seriesId: 1 });
mockTestAttemptSchema.index({ isCompleted: 1, isSubmitted: 1 });
mockTestAttemptSchema.index({ createdAt: -1 });

// Compound index for unique attempt per student per test
mockTestAttemptSchema.index({ studentId: 1, testId: 1 }, { unique: true });

module.exports = mongoose.model('MockTestAttempt', mockTestAttemptSchema);
