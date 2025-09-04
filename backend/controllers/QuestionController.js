const mongoose = require("mongoose");
const Question = require("../models/test/Question");




// ✅ Create Question
const createQuestion = async (req, res) => {
  try {
    const {
      testId,
      questionText,
      options,
      correctOption,
      explanation,
      difficulty,
      marks,
      negativeMarks,
      isActive
    } = req.body;

    // ✅ Validate required fields
    if (
      !testId ||
      !questionText ||
      !options ||
      !options.A ||
      !options.B ||
      !options.C ||
      !options.D ||
      !correctOption
    ) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing: testId, questionText, options.A/B/C/D, correctOption"
      });
    }

    // ✅ Validate correctOption
    if (!["A", "B", "C", "D"].includes(correctOption)) {
      return res.status(400).json({
        success: false,
        message: "Correct option must be A, B, C, or D"
      });
    }

    const question = new Question({
      testId,
      test: testId, // for backward compatibility
      questionText,
      options,
      correctOption,
      explanation: explanation || "",
      difficulty: difficulty || "Medium",
      marks: marks || 2,
      negativeMarks: negativeMarks || 0.66,
      isActive: isActive !== undefined ? isActive : true
    });

    await question.save();
    console.log("✅ Question created:", question._id);

    res.status(201).json({ success: true, question });

  } catch (err) {
    console.error("❌ Question creation error:", err.message);
    res.status(500).json({ success: false, message: "Failed to create question", error: err.message });
  }
};

// ✅ Get All Questions for a Test
const getQuestionsByTest = async (req, res) => {
  try {
    // Support both query parameter (?testId=) and path parameter (/:testId)
    const testId = req.query.testId || req.params.testId;

    if (!testId) {
      return res.status(400).json({ success: false, message: "Test ID is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(testId)) {
      return res.status(400).json({ success: false, message: "Invalid test ID" });
    }

    // Search by both testId and test for backward compatibility
    const questions = await Question.find({
      $or: [{ testId: testId }, { test: testId }]
    }).sort({ createdAt: 1 });

    res.status(200).json({ success: true, questions });

  } catch (err) {
    console.error("❌ Question fetch error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch questions", error: err.message });
  }
};

// ✅ Update Question
const updateQuestion = async (req, res) => {
  try {
    const updated = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!updated) {
      return res.status(404).json({ success: false, message: "Question not found" });
    }

    res.status(200).json({ success: true, question: updated });

  } catch (err) {
    console.error("❌ Update error:", err.message);
    res.status(500).json({ success: false, message: "Update failed", error: err.message });
  }
};

// ✅ Delete Question
const deleteQuestion = async (req, res) => {
  try {
    const deleted = await Question.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Question not found" });
    }

    res.status(200).json({ success: true, message: "Question deleted" });

  } catch (err) {
    console.error("❌ Delete error:", err.message);
    res.status(500).json({ success: false, message: "Delete failed", error: err.message });
  }
};

// ✅ Get Tests by Topic ID


module.exports = {
  createQuestion,
  getQuestionsByTest,
  updateQuestion,
  deleteQuestion,
  
};
