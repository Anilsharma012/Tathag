const StudentPracticeResponse = require("../models/practice/StudentPracticeResponse");
const PracticeTest = require("../models/practice/PracticeTest");
const PracticeQuestion = require("../models/practice/PracticeQuestion");

// Start a practice test
exports.startPracticeTest = async (req, res) => {
  try {
    const { practiceTestId } = req.params;
    const studentId = req.user.id;

    // Check if test exists and is published
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

    // Check if student has already started this test
    let existingResponse = await StudentPracticeResponse.findOne({
      studentId,
      practiceTestId
    });

    if (existingResponse && existingResponse.isCompleted) {
      return res.status(400).json({
        success: false,
        message: "You have already completed this test"
      });
    }

    // Get all questions for this test
    const questions = await PracticeQuestion.find({
      practiceTestId,
      isActive: true
    }).sort({ sectionName: 1, order: 1 });

    if (!existingResponse) {
      // Create new response record
      const responses = questions.map(q => ({
        questionId: q._id,
        selectedOptionIndex: -1,
        isMarkedForReview: false,
        timeTaken: 0,
        sectionName: q.sectionName
      }));

      existingResponse = new StudentPracticeResponse({
        studentId,
        practiceTestId,
        responses,
        testStartTime: new Date(),
        currentSection: practiceTest.sections[0]?.name || "Quant"
      });

      await existingResponse.save();
    }

    res.status(200).json({
      success: true,
      message: "Test started successfully",
      response: existingResponse
    });
  } catch (error) {
    console.error("Error starting practice test:", error);
    res.status(500).json({
      success: false,
      message: "Failed to start practice test",
      error: error.message
    });
  }
};

// Save student response for a question
exports.saveResponse = async (req, res) => {
  try {
    const { practiceTestId, questionId } = req.params;
    const { selectedOptionIndex, isMarkedForReview, timeTaken } = req.body;
    const studentId = req.user.id;

    const response = await StudentPracticeResponse.findOne({
      studentId,
      practiceTestId
    });

    if (!response) {
      return res.status(404).json({
        success: false,
        message: "Test session not found"
      });
    }

    if (response.isCompleted) {
      return res.status(400).json({
        success: false,
        message: "Test has already been completed"
      });
    }

    // Update the response for this question
    const questionResponse = response.responses.find(
      r => r.questionId.toString() === questionId
    );

    if (questionResponse) {
      questionResponse.selectedOptionIndex = selectedOptionIndex;
      questionResponse.isMarkedForReview = isMarkedForReview;
      questionResponse.timeTaken = timeTaken;
    }

    await response.save();

    res.status(200).json({
      success: true,
      message: "Response saved successfully"
    });
  } catch (error) {
    console.error("Error saving response:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save response",
      error: error.message
    });
  }
};

// Switch section
exports.switchSection = async (req, res) => {
  try {
    const { practiceTestId } = req.params;
    const { sectionName, timeSpent } = req.body;
    const studentId = req.user.id;

    const response = await StudentPracticeResponse.findOne({
      studentId,
      practiceTestId
    });

    if (!response) {
      return res.status(404).json({
        success: false,
        message: "Test session not found"
      });
    }

    // Update time spent in current section
    const currentSectionTime = response.sectionWiseTime.find(
      s => s.sectionName === response.currentSection
    );

    if (currentSectionTime) {
      currentSectionTime.timeSpent = timeSpent;
      currentSectionTime.endTime = new Date();
    } else {
      response.sectionWiseTime.push({
        sectionName: response.currentSection,
        timeSpent,
        startTime: response.testStartTime,
        endTime: new Date()
      });
    }

    // Update current section
    response.currentSection = sectionName;

    // Add start time for new section if not exists
    const newSectionTime = response.sectionWiseTime.find(
      s => s.sectionName === sectionName
    );

    if (!newSectionTime) {
      response.sectionWiseTime.push({
        sectionName,
        timeSpent: 0,
        startTime: new Date()
      });
    }

    await response.save();

    res.status(200).json({
      success: true,
      message: "Section switched successfully"
    });
  } catch (error) {
    console.error("Error switching section:", error);
    res.status(500).json({
      success: false,
      message: "Failed to switch section",
      error: error.message
    });
  }
};

// Submit test and calculate scores
exports.submitTest = async (req, res) => {
  try {
    const { practiceTestId } = req.params;
    const studentId = req.user.id;

    const response = await StudentPracticeResponse.findOne({
      studentId,
      practiceTestId
    });

    if (!response) {
      return res.status(404).json({
        success: false,
        message: "Test session not found"
      });
    }

    if (response.isCompleted) {
      return res.status(400).json({
        success: false,
        message: "Test has already been completed"
      });
    }

    // Get all questions with correct answers
    const questions = await PracticeQuestion.find({
      practiceTestId,
      isActive: true
    });

    // Calculate scores
    const scores = await calculateScores(response, questions);

    // Update response with scores and completion status
    response.scores = scores;
    response.isCompleted = true;
    response.testEndTime = new Date();

    await response.save();

    res.status(200).json({
      success: true,
      message: "Test submitted successfully",
      scores
    });
  } catch (error) {
    console.error("Error submitting test:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit test",
      error: error.message
    });
  }
};

// Get test result
exports.getTestResult = async (req, res) => {
  try {
    const { practiceTestId } = req.params;
    const studentId = req.user.id;

    const response = await StudentPracticeResponse.findOne({
      studentId,
      practiceTestId,
      isCompleted: true
    }).populate('practiceTestId', 'title testType totalQuestions totalMarks');

    if (!response) {
      return res.status(404).json({
        success: false,
        message: "Test result not found"
      });
    }

    // Get questions with correct answers for detailed result
    const questions = await PracticeQuestion.find({
      practiceTestId,
      isActive: true
    }).select('questionText correctOptionIndex explanation sectionName marks negativeMarks');

    // Merge response data with question details
    const detailedResponses = response.responses.map(resp => {
      const question = questions.find(q => q._id.toString() === resp.questionId.toString());
      return {
        ...resp.toObject(),
        question: question ? {
          questionText: question.questionText,
          correctOptionIndex: question.correctOptionIndex,
          explanation: question.explanation,
          marks: question.marks,
          negativeMarks: question.negativeMarks
        } : null,
        isCorrect: question && resp.selectedOptionIndex === question.correctOptionIndex
      };
    });

    res.status(200).json({
      success: true,
      result: {
        test: response.practiceTestId,
        scores: response.scores,
        testStartTime: response.testStartTime,
        testEndTime: response.testEndTime,
        sectionWiseTime: response.sectionWiseTime,
        responses: detailedResponses
      }
    });
  } catch (error) {
    console.error("Error fetching test result:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch test result",
      error: error.message
    });
  }
};

// Get student's test history
exports.getStudentTestHistory = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const responses = await StudentPracticeResponse.find({
      studentId,
      isCompleted: true
    })
    .populate('practiceTestId', 'title testType totalQuestions totalMarks')
    .sort({ testEndTime: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await StudentPracticeResponse.countDocuments({
      studentId,
      isCompleted: true
    });

    res.status(200).json({
      success: true,
      history: responses,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalTests: total
      }
    });
  } catch (error) {
    console.error("Error fetching test history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch test history",
      error: error.message
    });
  }
};

// Helper function to calculate scores
async function calculateScores(response, questions) {
  const sections = ["Quant", "LRDI", "VARC"];
  let overallStats = {
    totalQuestions: 0,
    attempted: 0,
    correct: 0,
    wrong: 0,
    markedForReview: 0,
    totalMarks: 0,
    scoreObtained: 0
  };

  let sectionWiseStats = [];

  for (const sectionName of sections) {
    const sectionQuestions = questions.filter(q => q.sectionName === sectionName);
    const sectionResponses = response.responses.filter(r => r.sectionName === sectionName);

    let sectionStats = {
      sectionName,
      totalQuestions: sectionQuestions.length,
      attempted: 0,
      correct: 0,
      wrong: 0,
      markedForReview: 0,
      totalMarks: 0,
      scoreObtained: 0
    };

    for (const resp of sectionResponses) {
      const question = sectionQuestions.find(q => q._id.toString() === resp.questionId.toString());
      if (!question) continue;

      sectionStats.totalMarks += question.marks;

      if (resp.isMarkedForReview) {
        sectionStats.markedForReview++;
      }

      if (resp.selectedOptionIndex !== -1) {
        sectionStats.attempted++;
        
        if (resp.selectedOptionIndex === question.correctOptionIndex) {
          sectionStats.correct++;
          sectionStats.scoreObtained += question.marks;
        } else {
          sectionStats.wrong++;
          sectionStats.scoreObtained -= question.negativeMarks;
        }
      }
    }

    // Ensure score doesn't go below 0
    sectionStats.scoreObtained = Math.max(0, sectionStats.scoreObtained);

    // Add to overall stats
    overallStats.totalQuestions += sectionStats.totalQuestions;
    overallStats.attempted += sectionStats.attempted;
    overallStats.correct += sectionStats.correct;
    overallStats.wrong += sectionStats.wrong;
    overallStats.markedForReview += sectionStats.markedForReview;
    overallStats.totalMarks += sectionStats.totalMarks;
    overallStats.scoreObtained += sectionStats.scoreObtained;

    sectionWiseStats.push(sectionStats);
  }

  return {
    overall: overallStats,
    sectionWise: sectionWiseStats
  };
}

module.exports = {
  startPracticeTest: exports.startPracticeTest,
  saveResponse: exports.saveResponse,
  switchSection: exports.switchSection,
  submitTest: exports.submitTest,
  getTestResult: exports.getTestResult,
  getStudentTestHistory: exports.getStudentTestHistory
};
