const Response = require("../models/test/Response"); // ✅ Correct model
const Question = require("../models/test/Question");

const submitTest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { testId, answers } = req.body;

    if (!testId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: "Test ID and answers are required" });
    }

    let totalScore = 0;
    const finalAnswers = [];

    for (let ans of answers) {
      const question = await Question.findById(ans.questionId);
      if (!question) continue;

      const isCorrect = ans.selectedOptionIndex === question.correctOptionIndex;
      const marksEarned = isCorrect ? question.marks : -question.negativeMarks;

      totalScore += marksEarned;

      finalAnswers.push({
        questionId: question._id,
        selectedOptionIndex: ans.selectedOptionIndex,
        isCorrect,
        marksEarned
      });
    }

    const response = new Response({
      user: userId,
      test: testId,
      answers: finalAnswers,
      totalScore
    });

    await response.save();

    res.status(201).json({
      success: true,
      message: "✅ Test submitted successfully",
      totalScore,
      answers: finalAnswers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "❌ Submission failed", error: error.message });
  }
};

const getUserResponses = async (req, res) => {
  try {
    const responses = await Response.find({ user: req.user.id }).populate("test");
    res.status(200).json({ success: true, responses });
  } catch (error) {
    res.status(500).json({ message: "❌ Error fetching responses", error: error.message });
  }
};

module.exports = {
  submitTest,
  getUserResponses
};
