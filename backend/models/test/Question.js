const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Test",
    required: true,
  },
  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Test",
  },
  questionText: {
    type: String,
    required: true,
  },
  options: {
    A: { type: String, required: true },
    B: { type: String, required: true },
    C: { type: String, required: true },
    D: { type: String, required: true }
  },
  correctOption: {
    type: String,
    enum: ["A", "B", "C", "D"],
    required: true,
  },
  explanation: {
    type: String,
    default: "",
  },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    default: "Medium",
  },
  marks: {
    type: Number,
    default: 2,
  },
  negativeMarks: {
    type: Number,
    default: 0.66,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

module.exports = mongoose.models.Question || mongoose.model("Question", questionSchema);
