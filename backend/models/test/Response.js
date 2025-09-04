const mongoose = require("mongoose");

const responseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // 👈 must be your User model
    required: true
  },
  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Test",
    required: true
  },
  answers: [
    {
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question"
      },
      selectedOptionIndex: Number,
      isCorrect: Boolean,
      marksEarned: Number
    }
  ],
  totalScore: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.models.Response || mongoose.model("Response", responseSchema);
