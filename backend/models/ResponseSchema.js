const mongoose = require("mongoose");

const responseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Test",
    required: true,
  },
  answers: [
    {
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
        required: true,
      },
      selectedOptionIndex: {
        type: Number,
        default: null, // For unattempted
      },
      isCorrect: Boolean,
      marksEarned: Number
    }
  ],
  totalScore: {
    type: Number,
    default: 0,
  },
  attemptedAt: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

module.exports = mongoose.models.Response || mongoose.model("Response", responseSchema);
