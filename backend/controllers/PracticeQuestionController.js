const PracticeQuestion = require("../models/practice/PracticeQuestion");
const PracticeTest = require("../models/practice/PracticeTest");

// Admin Controllers
exports.addQuestionToPracticeTest = async (req, res) => {
  try {
    const { practiceTestId } = req.params;
    const questionData = req.body;

    // Verify practice test exists
    const practiceTest = await PracticeTest.findById(practiceTestId);
    if (!practiceTest) {
      return res.status(404).json({
        success: false,
        message: "Practice test not found"
      });
    }

    const question = new PracticeQuestion({
      practiceTestId,
      ...questionData
    });

    await question.save();

    // Update practice test question count and marks
    await updatePracticeTestStats(practiceTestId);

    res.status(201).json({
      success: true,
      message: "Question added successfully",
      question
    });
  } catch (error) {
    console.error("Error adding question:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add question",
      error: error.message
    });
  }
};

exports.getQuestionsByPracticeTest = async (req, res) => {
  try {
    const { practiceTestId } = req.params;
    const { sectionName } = req.query;

    let filter = { practiceTestId, isActive: true };
    if (sectionName) {
      filter.sectionName = sectionName;
    }

    const questions = await PracticeQuestion.find(filter)
      .sort({ sectionName: 1, order: 1 });

    res.status(200).json({
      success: true,
      questions
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch questions",
      error: error.message
    });
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const question = await PracticeQuestion.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found"
      });
    }

    // Update practice test stats
    await updatePracticeTestStats(question.practiceTestId);

    res.status(200).json({
      success: true,
      message: "Question updated successfully",
      question
    });
  } catch (error) {
    console.error("Error updating question:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update question",
      error: error.message
    });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await PracticeQuestion.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found"
      });
    }

    // Update practice test stats
    await updatePracticeTestStats(question.practiceTestId);

    res.status(200).json({
      success: true,
      message: "Question deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting question:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete question",
      error: error.message
    });
  }
};

exports.bulkUploadQuestions = async (req, res) => {
  try {
    const { practiceTestId } = req.params;
    const { questions } = req.body;

    // Verify practice test exists
    const practiceTest = await PracticeTest.findById(practiceTestId);
    if (!practiceTest) {
      return res.status(404).json({
        success: false,
        message: "Practice test not found"
      });
    }

    // Add practiceTestId to each question
    const questionsWithTestId = questions.map(q => ({
      ...q,
      practiceTestId
    }));

    const insertedQuestions = await PracticeQuestion.insertMany(questionsWithTestId);

    // Update practice test stats
    await updatePracticeTestStats(practiceTestId);

    res.status(201).json({
      success: true,
      message: `${insertedQuestions.length} questions uploaded successfully`,
      questions: insertedQuestions
    });
  } catch (error) {
    console.error("Error bulk uploading questions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload questions",
      error: error.message
    });
  }
};

// Student Controllers
exports.getQuestionsForTest = async (req, res) => {
  try {
    const { practiceTestId } = req.params;
    const { sectionName } = req.query;

    // Verify test is published
    const practiceTest = await PracticeTest.findOne({
      _id: practiceTestId,
      published: true,
      isActive: true
    });

    if (!practiceTest) {
      return res.status(404).json({
        success: false,
        message: "Practice test not found or not published"
      });
    }

    let filter = { practiceTestId, isActive: true };
    if (sectionName) {
      filter.sectionName = sectionName;
    }

    // For students, don't send correct answers and explanations during test
    const questions = await PracticeQuestion.find(filter)
      .select('-correctOptionIndex -explanation -explanationImage')
      .sort({ sectionName: 1, order: 1 });

    res.status(200).json({
      success: true,
      questions
    });
  } catch (error) {
    console.error("Error fetching questions for test:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch questions",
      error: error.message
    });
  }
};

// Helper function to update practice test statistics
async function updatePracticeTestStats(practiceTestId) {
  try {
    const sections = ["Quant", "LRDI", "VARC"];
    let totalQuestions = 0;
    let totalMarks = 0;
    let updatedSections = [];

    for (const sectionName of sections) {
      const sectionQuestions = await PracticeQuestion.find({
        practiceTestId,
        sectionName,
        isActive: true
      });

      if (sectionQuestions.length > 0) {
        const sectionTotalQuestions = sectionQuestions.length;
        const sectionTotalMarks = sectionQuestions.reduce((sum, q) => sum + q.marks, 0);
        
        totalQuestions += sectionTotalQuestions;
        totalMarks += sectionTotalMarks;

        // Find existing section or create new one
        const practiceTest = await PracticeTest.findById(practiceTestId);
        const existingSection = practiceTest.sections.find(s => s.name === sectionName);
        
        if (existingSection) {
          existingSection.totalQuestions = sectionTotalQuestions;
          existingSection.totalMarks = sectionTotalMarks;
        }
        
        updatedSections.push({
          name: sectionName,
          duration: existingSection ? existingSection.duration : 60, // Default 60 minutes
          totalQuestions: sectionTotalQuestions,
          totalMarks: sectionTotalMarks
        });
      }
    }

    await PracticeTest.findByIdAndUpdate(practiceTestId, {
      totalQuestions,
      totalMarks,
      sections: updatedSections
    });
  } catch (error) {
    console.error("Error updating practice test stats:", error);
  }
}

module.exports = {
  addQuestionToPracticeTest: exports.addQuestionToPracticeTest,
  getQuestionsByPracticeTest: exports.getQuestionsByPracticeTest,
  updateQuestion: exports.updateQuestion,
  deleteQuestion: exports.deleteQuestion,
  bulkUploadQuestions: exports.bulkUploadQuestions,
  getQuestionsForTest: exports.getQuestionsForTest
};
