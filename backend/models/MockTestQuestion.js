const mongoose = require('mongoose');

const mockTestQuestionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, 'Question text is required']
  },
  questionType: {
    type: String,
    enum: ['MCQ', 'MSQ', 'NAT'], // Multiple Choice Question, Multiple Select Question, Numerical Answer Type
    default: 'MCQ'
  },
  section: {
    type: String,
    required: true,
    enum: ['VARC', 'DILR', 'QA']
  },
  topic: {
    type: String,
    trim: true
  },
  passage: {
    type: String, // For RC questions
    default: null
  },
  images: [{
    url: String,
    caption: String
  }],
  options: [{
    optionText: {
      type: String,
      required: true
    },
    optionImage: {
      type: String,
      default: null
    },
    isCorrect: {
      type: Boolean,
      default: false
    }
  }],
  correctAnswer: {
    type: mongoose.Schema.Types.Mixed, // Can be string, number, or array for different question types
    required: true
  },
  explanation: {
    type: String,
    trim: true
  },
  marks: {
    positive: {
      type: Number,
      default: 3
    },
    negative: {
      type: Number,
      default: -1
    }
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  timeToSolve: {
    type: Number, // in minutes (expected time)
    default: 2
  },
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  usageCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
mockTestQuestionSchema.index({ section: 1, topic: 1 });
mockTestQuestionSchema.index({ difficulty: 1 });
mockTestQuestionSchema.index({ createdBy: 1 });
mockTestQuestionSchema.index({ isActive: 1 });

module.exports = mongoose.model('MockTestQuestion', mockTestQuestionSchema);
