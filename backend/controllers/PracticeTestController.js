const PracticeTest = require("../models/practice/PracticeTest");
const PracticeQuestion = require("../models/practice/PracticeQuestion");
const StudentPracticeResponse = require("../models/practice/StudentPracticeResponse");

// Admin Controllers
exports.createPracticeTest = async (req, res) => {
  try {
    const { title, description, testType, duration, sectionWiseTiming, instructions, sections } = req.body;
    
    const practiceTest = new PracticeTest({
      title,
      description,
      testType,
      duration,
      sectionWiseTiming,
      instructions,
      sections,
      createdBy: req.user.id
    });

    await practiceTest.save();
    
    res.status(201).json({
      success: true,
      message: "Practice test created successfully",
      practiceTest
    });
  } catch (error) {
    console.error("Error creating practice test:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create practice test",
      error: error.message
    });
  }
};

exports.getAllPracticeTests = async (req, res) => {
  try {
    const practiceTests = await PracticeTest.find({ isActive: true })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      practiceTests
    });
  } catch (error) {
    console.error("Error fetching practice tests:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch practice tests",
      error: error.message
    });
  }
};

exports.getPracticeTestById = async (req, res) => {
  try {
    const { id } = req.params;
    const practiceTest = await PracticeTest.findById(id)
      .populate('createdBy', 'name email');

    if (!practiceTest) {
      return res.status(404).json({
        success: false,
        message: "Practice test not found"
      });
    }

    res.status(200).json({
      success: true,
      practiceTest
    });
  } catch (error) {
    console.error("Error fetching practice test:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch practice test",
      error: error.message
    });
  }
};

exports.updatePracticeTest = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const practiceTest = await PracticeTest.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!practiceTest) {
      return res.status(404).json({
        success: false,
        message: "Practice test not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Practice test updated successfully",
      practiceTest
    });
  } catch (error) {
    console.error("Error updating practice test:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update practice test",
      error: error.message
    });
  }
};

exports.deletePracticeTest = async (req, res) => {
  try {
    const { id } = req.params;

    const practiceTest = await PracticeTest.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!practiceTest) {
      return res.status(404).json({
        success: false,
        message: "Practice test not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Practice test deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting practice test:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete practice test",
      error: error.message
    });
  }
};

exports.publishPracticeTest = async (req, res) => {
  try {
    const { id } = req.params;
    const { published } = req.body;

    const practiceTest = await PracticeTest.findByIdAndUpdate(
      id,
      { published },
      { new: true }
    );

    if (!practiceTest) {
      return res.status(404).json({
        success: false,
        message: "Practice test not found"
      });
    }

    res.status(200).json({
      success: true,
      message: `Practice test ${published ? 'published' : 'unpublished'} successfully`,
      practiceTest
    });
  } catch (error) {
    console.error("Error publishing practice test:", error);
    res.status(500).json({
      success: false,
      message: "Failed to publish practice test",
      error: error.message
    });
  }
};

// Student Controllers
exports.getPublishedPracticeTests = async (req, res) => {
  try {
    const { testType } = req.query;
    
    let filter = { published: true, isActive: true };
    if (testType && testType !== 'all') {
      filter.testType = testType;
    }

    const practiceTests = await PracticeTest.find(filter)
      .select('title description testType duration sections totalQuestions totalMarks createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      practiceTests
    });
  } catch (error) {
    console.error("Error fetching published practice tests:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch practice tests",
      error: error.message
    });
  }
};

exports.getPracticeTestForStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user.id;

    const practiceTest = await PracticeTest.findOne({
      _id: id,
      published: true,
      isActive: true
    }).select('title description testType duration sectionWiseTiming instructions sections totalQuestions totalMarks');

    if (!practiceTest) {
      return res.status(404).json({
        success: false,
        message: "Practice test not found or not published"
      });
    }

    // Check if student has already attempted this test
    const existingResponse = await StudentPracticeResponse.findOne({
      studentId,
      practiceTestId: id
    });

    res.status(200).json({
      success: true,
      practiceTest,
      hasAttempted: !!existingResponse,
      isCompleted: existingResponse?.isCompleted || false
    });
  } catch (error) {
    console.error("Error fetching practice test for student:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch practice test",
      error: error.message
    });
  }
};

module.exports = {
  createPracticeTest: exports.createPracticeTest,
  getAllPracticeTests: exports.getAllPracticeTests,
  getPracticeTestById: exports.getPracticeTestById,
  updatePracticeTest: exports.updatePracticeTest,
  deletePracticeTest: exports.deletePracticeTest,
  publishPracticeTest: exports.publishPracticeTest,
  getPublishedPracticeTests: exports.getPublishedPracticeTests,
  getPracticeTestForStudent: exports.getPracticeTestForStudent
};
