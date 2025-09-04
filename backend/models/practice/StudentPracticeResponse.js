const mongoose = require("mongoose");

const studentPracticeResponseSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  practiceTestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PracticeTest",
    required: true
  },
  responses: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PracticeQuestion",
      required: true
    },
    selectedOptionIndex: {
      type: Number,
      default: -1 // -1 means not attempted
    },
    isMarkedForReview: {
      type: Boolean,
      default: false
    },
    timeTaken: {
      type: Number, // Time taken in seconds
      default: 0
    },
    sectionName: {
      type: String,
      enum: ["Quant", "LRDI", "VARC"],
      required: true
    }
  }],
  testStartTime: {
    type: Date,
    required: true
  },
  testEndTime: {
    type: Date
  },
  sectionWiseTime: [{
    sectionName: String,
    timeSpent: Number, // Time spent in seconds
    startTime: Date,
    endTime: Date
  }],
  currentSection: {
    type: String,
    enum: ["Quant", "LRDI", "VARC"],
    default: "Quant"
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  scores: {
    overall: {
      totalQuestions: { type: Number, default: 0 },
      attempted: { type: Number, default: 0 },
      correct: { type: Number, default: 0 },
      wrong: { type: Number, default: 0 },
      markedForReview: { type: Number, default: 0 },
      totalMarks: { type: Number, default: 0 },
      scoreObtained: { type: Number, default: 0 }
    },
    sectionWise: [{
      sectionName: String,
      totalQuestions: { type: Number, default: 0 },
      attempted: { type: Number, default: 0 },
      correct: { type: Number, default: 0 },
      wrong: { type: Number, default: 0 },
      markedForReview: { type: Number, default: 0 },
      totalMarks: { type: Number, default: 0 },
      scoreObtained: { type: Number, default: 0 }
    }]
  }
}, { timestamps: true });

// Compound index for efficient querying
studentPracticeResponseSchema.index({ studentId: 1, practiceTestId: 1 }, { unique: true });
studentPracticeResponseSchema.index({ studentId: 1, isCompleted: 1 });

module.exports = mongoose.model("StudentPracticeResponse", studentPracticeResponseSchema);
