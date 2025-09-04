const MockTestSeries = require('../models/MockTestSeries');
const MockTest = require('../models/MockTest');
const MockTestQuestion = require('../models/MockTestQuestion');
const MockTestAttempt = require('../models/MockTestAttempt');
const User = require('../models/UserSchema');

// Get all published mock test series for students
const getPublishedSeries = async (req, res) => {
  try {
    console.log('📚 Fetching published mock test series');
    const { category = 'all', page = 1, limit = 10 } = req.query;

    const filter = {
      isActive: true,
      isPublished: true
    };

    if (category && category !== 'all') {
      filter.category = category;
    }

    const series = await MockTestSeries.find(filter)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await MockTestSeries.countDocuments(filter);

    console.log(`✅ Found ${series.length} published mock test series`);
    res.status(200).json({
      success: true,
      series,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Error fetching mock test series:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mock test series',
      error: error.message
    });
  }
};

// Get tests in a specific series
const getTestsInSeries = async (req, res) => {
  try {
    const { seriesId } = req.params;
    const userId = req.user ? req.user.id : null;

    console.log(`📋 Fetching tests for series: ${seriesId}${userId ? ` (authenticated user: ${userId})` : ' (guest user)'}`);

    const series = await MockTestSeries.findById(seriesId);
    if (!series || !series.isActive || !series.isPublished) {
      return res.status(404).json({
        success: false,
        message: 'Mock test series not found'
      });
    }

    const tests = await MockTest.find({
      seriesId: seriesId,
      isActive: true,
      isPublished: true
    }).sort({ testNumber: 1 });

    let testWithStatus;

    if (userId) {
      // For authenticated users, check which tests they have attempted
      let attempts = [];
      try {
        // Only query if userId is a valid ObjectId
        const mongoose = require('mongoose');
        if (mongoose.Types.ObjectId.isValid(userId)) {
          attempts = await MockTestAttempt.find({
            studentId: userId,
            seriesId: seriesId
          });
        } else {
          console.log(`⚠️ Invalid userId format: ${userId}, treating as guest user`);
        }
      } catch (error) {
        console.log(`⚠️ Error querying attempts for user ${userId}:`, error.message);
        attempts = [];
      }

      testWithStatus = tests.map(test => {
        const attempt = attempts.find(att => att.testId.toString() === test._id.toString());
        return {
          ...test.toObject(),
          hasAttempted: !!attempt,
          isCompleted: attempt ? attempt.isCompleted : false,
          score: attempt ? attempt.score.total : null,
          attemptDate: attempt ? attempt.createdAt : null
        };
      });
    } else {
      // For guest users, show basic test info without attempt status
      testWithStatus = tests.map(test => ({
        ...test.toObject(),
        hasAttempted: false,
        isCompleted: false,
        score: null,
        attemptDate: null
      }));
    }

    console.log(`✅ Found ${tests.length} tests in series`);
    res.status(200).json({
      success: true,
      series,
      tests: testWithStatus
    });
  } catch (error) {
    console.error('❌ Error fetching tests in series:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tests',
      error: error.message
    });
  }
};

// Get test details and instructions
const getTestDetails = async (req, res) => {
  try {
    const { testId } = req.params;
    const userId = req.user ? req.user.id : null;

    console.log(`📖 Fetching test details: ${testId}${userId ? ` (authenticated user: ${userId})` : ' (guest user)'}`);

    const test = await MockTest.findById(testId)
      .populate('seriesId', 'title category')
      .populate('createdBy', 'name');

    if (!test || !test.isActive || !test.isPublished) {
      return res.status(404).json({
        success: false,
        message: 'Mock test not found'
      });
    }

    // Check if student has access to this test
    const series = test.seriesId;
    let isEnrolled = false;

    if (userId) {
      try {
        const mongoose = require('mongoose');
        if (userId === '507f1f77bcf86cd799439011') {
          isEnrolled = test.isFree; // Allow dev user access to free tests
        } else if (mongoose.Types.ObjectId.isValid(userId)) {
          isEnrolled = series.enrolledStudents.some(
            enrollment => enrollment.studentId.toString() === userId
          );
        }
      } catch (error) {
        console.log(`⚠️ Error checking enrollment for user ${userId}:`, error.message);
      }
    }

    if (!test.isFree && !isEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'You need to purchase this mock test series to access this test'
      });
    }

    // Check if student has already attempted this test
    let existingAttempt = null;
    if (userId) {
      try {
        const mongoose = require('mongoose');
        if (userId === '507f1f77bcf86cd799439011') {
          // For dev user, don't check existing attempts to allow multiple attempts
          existingAttempt = null;
        } else if (mongoose.Types.ObjectId.isValid(userId)) {
          existingAttempt = await MockTestAttempt.findOne({
            studentId: userId,
            testId: testId
          });
        }
      } catch (error) {
        console.log(`⚠️ Error checking existing attempt for user ${userId}:`, error.message);
      }
    }

    console.log('✅ Test details fetched successfully');
    res.status(200).json({
      success: true,
      test,
      hasAttempted: !!existingAttempt,
      attempt: existingAttempt
    });
  } catch (error) {
    console.error('❌ Error fetching test details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch test details',
      error: error.message
    });
  }
};

// Start a mock test attempt
const startTestAttempt = async (req, res) => {
  try {
    console.log('🔍 startTestAttempt called');
    console.log('Request params:', req.params);
    console.log('Request user:', req.user);
    console.log('Request headers authorization:', req.headers.authorization);

    const { testId } = req.params;
    const userId = req.user ? req.user.id : 'no-user';
    const mongoose = require('mongoose');

    console.log(`🚀 Starting test attempt for test: ${testId}, user: ${userId}`);

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(testId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid test ID format'
      });
    }

    // Validate ObjectId format for all users now (including dev user with proper ObjectId)
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    const test = await MockTest.findById(testId).populate('seriesId');
    if (!test || !test.isActive || !test.isPublished) {
      return res.status(404).json({
        success: false,
        message: 'Mock test not found'
      });
    }

    // Check if student has access
    const series = test.seriesId;
    let isEnrolled = false;

    // For development user (using fixed ObjectId), allow access to free tests
    if (userId === '507f1f77bcf86cd799439011') {
      isEnrolled = test.isFree;
    } else if (series.enrolledStudents && series.enrolledStudents.length > 0) {
      isEnrolled = series.enrolledStudents.some(
        enrollment => enrollment.studentId.toString() === userId
      );
    }

    if (!test.isFree && !isEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Please purchase the mock test series.'
      });
    }

    // Check if already attempted (skip for development user to allow multiple attempts)
    let existingAttempt = null;
    if (userId !== '507f1f77bcf86cd799439011') {
      existingAttempt = await MockTestAttempt.findOne({
        studentId: userId,
        testId: testId
      });

      if (existingAttempt) {
        // Return the existing attempt for resume
        return res.status(200).json({
          success: true,
          message: 'Resuming existing attempt',
          attempt: existingAttempt,
          resuming: true
        });
      }
    }

    // Create new attempt
    const newAttempt = new MockTestAttempt({
      studentId: userId,
      testId: testId,
      seriesId: test.seriesId._id,
      totalDuration: test.duration,
      startTime: new Date(),
      responses: []
    });

    await newAttempt.save();

    // Get questions for the test
    const questionsWithSections = [];
    for (const section of test.sections) {
      const questions = await MockTestQuestion.find({
        _id: { $in: section.questions }
      }).select('_id questionText questionType section images options marks');
      
      questionsWithSections.push({
        section: section.name,
        duration: section.duration,
        questions: questions
      });
    }

    console.log('✅ Test attempt started successfully');
    res.status(201).json({
      success: true,
      message: 'Test attempt started successfully',
      attempt: newAttempt,
      test: {
        _id: test._id,
        title: test.title,
        duration: test.duration,
        sections: questionsWithSections,
        instructions: (() => {
          if (!test.instructions) return [];

          // If it's already an array, return it
          if (Array.isArray(test.instructions)) return test.instructions;

          // If it's an object with general/sectionSpecific properties
          if (typeof test.instructions === 'object') {
            const flattened = [];
            if (test.instructions.general && Array.isArray(test.instructions.general)) {
              flattened.push(...test.instructions.general);
            }
            if (test.instructions.sectionSpecific && Array.isArray(test.instructions.sectionSpecific)) {
              flattened.push(...test.instructions.sectionSpecific);
            }
            // If no general/sectionSpecific, try to convert the object to string
            if (flattened.length === 0) {
              flattened.push(JSON.stringify(test.instructions));
            }
            return flattened;
          }

          // If it's a string, wrap in array
          return [test.instructions];
        })()
      }
    });
  } catch (error) {
    console.error('❌ Error starting test attempt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start test attempt',
      error: error.message
    });
  }
};

// Save student response
const saveResponse = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { questionId, selectedAnswer, isMarkedForReview } = req.body;
    const userId = req.user.id;

    console.log(`💾 Saving response for attempt: ${attemptId}, question: ${questionId}`);

    const attempt = await MockTestAttempt.findOne({
      _id: attemptId,
      studentId: userId
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Test attempt not found'
      });
    }

    if (attempt.isCompleted || attempt.isSubmitted) {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify completed test'
      });
    }

    // Find existing response or create new one
    let responseIndex = attempt.responses.findIndex(
      resp => resp.questionId.toString() === questionId
    );

    if (responseIndex >= 0) {
      // Update existing response
      attempt.responses[responseIndex].selectedAnswer = selectedAnswer;
      attempt.responses[responseIndex].isAnswered = !!selectedAnswer;
      attempt.responses[responseIndex].isMarkedForReview = isMarkedForReview || false;
      attempt.responses[responseIndex].answeredAt = new Date();
    } else {
      // Add new response
      attempt.responses.push({
        questionId,
        selectedAnswer,
        isAnswered: !!selectedAnswer,
        isMarkedForReview: isMarkedForReview || false,
        isVisited: true,
        answeredAt: new Date()
      });
    }

    await attempt.save();

    console.log('✅ Response saved successfully');
    res.status(200).json({
      success: true,
      message: 'Response saved successfully'
    });
  } catch (error) {
    console.error('❌ Error saving response:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save response',
      error: error.message
    });
  }
};

// Submit test
const submitTest = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.id;

    console.log(`📤 Submitting test attempt: ${attemptId}`);

    const attempt = await MockTestAttempt.findOne({
      _id: attemptId,
      studentId: userId
    }).populate('testId');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Test attempt not found'
      });
    }

    if (attempt.isSubmitted) {
      return res.status(400).json({
        success: false,
        message: 'Test already submitted'
      });
    }

    // Calculate scores
    let totalScore = 0;
    let positiveMarks = 0;
    let negativeMarks = 0;

    for (const response of attempt.responses) {
      if (response.isAnswered) {
        const question = await MockTestQuestion.findById(response.questionId);
        
        if (question) {
          // Check if answer is correct
          let isCorrect = false;
          if (question.questionType === 'MCQ') {
            isCorrect = response.selectedAnswer === question.correctAnswer;
          } else if (question.questionType === 'MSQ') {
            // For multiple select questions
            isCorrect = JSON.stringify(response.selectedAnswer.sort()) === 
                       JSON.stringify(question.correctAnswer.sort());
          } else if (question.questionType === 'NAT') {
            isCorrect = parseFloat(response.selectedAnswer) === parseFloat(question.correctAnswer);
          }

          if (isCorrect) {
            totalScore += question.marks.positive;
            positiveMarks += question.marks.positive;
          } else {
            totalScore += question.marks.negative;
            negativeMarks += Math.abs(question.marks.negative);
          }
        }
      }
    }

    // Update attempt
    attempt.isCompleted = true;
    attempt.isSubmitted = true;
    attempt.endTime = new Date();
    attempt.timeSpent = Math.floor((attempt.endTime - attempt.startTime) / (1000 * 60)); // in minutes
    attempt.score.total = totalScore;
    attempt.marks.total = totalScore;
    attempt.marks.positive = positiveMarks;
    attempt.marks.negative = negativeMarks;

    await attempt.save();

    console.log('✅ Test submitted successfully');
    res.status(200).json({
      success: true,
      message: 'Test submitted successfully',
      score: totalScore,
      timeSpent: attempt.timeSpent
    });
  } catch (error) {
    console.error('❌ Error submitting test:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit test',
      error: error.message
    });
  }
};

// Get student's test history
const getTestHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    console.log(`📜 Fetching test history for user: ${userId}`);

    const attempts = await MockTestAttempt.find({ studentId: userId })
      .populate('testId', 'title testNumber')
      .populate('seriesId', 'title category')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await MockTestAttempt.countDocuments({ studentId: userId });

    console.log(`✅ Found ${attempts.length} test attempts`);
    res.status(200).json({
      success: true,
      attempts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Error fetching test history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch test history',
      error: error.message
    });
  }
};

// Get attempt data for resuming
const getAttemptData = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.id;

    console.log(`📖 Getting attempt data: ${attemptId} for user: ${userId}`);

    const attempt = await MockTestAttempt.findOne({
      _id: attemptId,
      studentId: userId
    }).populate('testId');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Test attempt not found'
      });
    }

    // Get test data with questions
    const test = attempt.testId;
    const questionsWithSections = [];

    for (const section of test.sections) {
      const questions = await MockTestQuestion.find({
        _id: { $in: section.questions }
      }).select('_id questionText questionType section images options marks');

      questionsWithSections.push({
        section: section.name,
        duration: section.duration,
        questions: questions
      });
    }

    // Calculate remaining time
    const startTime = new Date(attempt.startTime);
    const currentTime = new Date();
    const elapsedMinutes = Math.floor((currentTime - startTime) / (1000 * 60));
    const totalDurationMinutes = attempt.totalDuration;
    const remainingMinutes = Math.max(0, totalDurationMinutes - elapsedMinutes);

    // Convert responses to frontend format
    const responseMap = {};
    attempt.responses.forEach(resp => {
      if (resp.selectedAnswer) {
        responseMap[resp.questionId.toString()] = resp.selectedAnswer;
      }
    });

    console.log('✅ Attempt data retrieved successfully');
    res.status(200).json({
      success: true,
      test: {
        _id: test._id,
        title: test.title,
        duration: test.duration,
        sections: questionsWithSections,
        instructions: (() => {
          if (!test.instructions) return [];

          // If it's already an array, return it
          if (Array.isArray(test.instructions)) return test.instructions;

          // If it's an object with general/sectionSpecific properties
          if (typeof test.instructions === 'object') {
            const flattened = [];
            if (test.instructions.general && Array.isArray(test.instructions.general)) {
              flattened.push(...test.instructions.general);
            }
            if (test.instructions.sectionSpecific && Array.isArray(test.instructions.sectionSpecific)) {
              flattened.push(...test.instructions.sectionSpecific);
            }
            // If no general/sectionSpecific, try to convert the object to string
            if (flattened.length === 0) {
              flattened.push(JSON.stringify(test.instructions));
            }
            return flattened;
          }

          // If it's a string, wrap in array
          return [test.instructions];
        })()
      },
      attempt,
      timeRemaining: remainingMinutes * 60, // Convert to seconds
      responses: responseMap
    });
  } catch (error) {
    console.error('❌ Error getting attempt data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get attempt data',
      error: error.message
    });
  }
};

module.exports = {
  getPublishedSeries,
  getTestsInSeries,
  getTestDetails,
  startTestAttempt,
  getAttemptData,
  saveResponse,
  submitTest,
  getTestHistory
};
