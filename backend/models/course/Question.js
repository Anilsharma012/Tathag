const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Test",
    required: true
  },
  questionText: {
    type: String,
    required: true
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
    required: true
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
  type: {
    type: String,
    enum: ["MCQ", "Numeric", "Logical"],
    default: "MCQ"
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

module.exports = mongoose.models.Question || mongoose.model("Question", questionSchema);
