const mongoose = require("mongoose");

const practiceQuestionSchema = new mongoose.Schema({
  practiceTestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PracticeTest",
    required: true
  },
  sectionName: {
    type: String,
    enum: ["Quant", "LRDI", "VARC"],
    required: true
  },
  questionText: {
    type: String,
    required: true
  },
  questionImage: {
    type: String,
    default: ""
  },
  direction: {
    type: String,
    default: ""
  },
  options: {
    type: [String],
    validate: [optArray => optArray.length >= 2, "At least two options required"]
  },
  correctOptionIndex: {
    type: Number,
    required: true,
    min: 0
  },
  marks: {
    type: Number,
    default: 3
  },
  negativeMarks: {
    type: Number,
    default: 1
  },
  explanation: {
    type: String,
    default: ""
  },
  explanationImage: {
    type: String,
    default: ""
  },
  type: {
    type: String,
    enum: ["MCQ", "Numeric"],
    default: "MCQ"
  },
  difficultyLevel: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    default: "Medium"
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Index for efficient querying
practiceQuestionSchema.index({ practiceTestId: 1, sectionName: 1, order: 1 });

module.exports = mongoose.model("PracticeQuestion", practiceQuestionSchema);
