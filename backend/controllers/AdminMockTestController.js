const MockTestSeries = require('../models/MockTestSeries');
const MockTest = require('../models/MockTest');
const MockTestQuestion = require('../models/MockTestQuestion');
const MockTestAttempt = require('../models/MockTestAttempt');

// Create new mock test series
const createSeries = async (req, res) => {
  try {
    console.log('🆕 Creating new mock test series');
    const { title, description, category, freeTests, price, validity, tags } = req.body;
    const adminId = req.user.id;

    const series = new MockTestSeries({
      title,
      description,
      category,
      freeTests: freeTests || 0,
      price: price || 0,
      validity: validity || 365,
      tags: tags || [],
      createdBy: adminId
    });

    await series.save();

    console.log('✅ Mock test series created successfully');
    res.status(201).json({
      success: true,
      message: 'Mock test series created successfully',
      series
    });
  } catch (error) {
    console.error('❌ Error creating mock test series:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create mock test series',
      error: error.message
    });
  }
};

// Get all series for admin
const getAllSeries = async (req, res) => {
  try {
    console.log('📚 Admin fetching all mock test series');
    const { page = 1, limit = 10, category, search } = req.query;

    const filter = {};
    if (category && category !== 'all') {
      filter.category = category;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const series = await MockTestSeries.find(filter)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await MockTestSeries.countDocuments(filter);

    // Get series with test counts
    const seriesWithCounts = await Promise.all(
      series.map(async (s) => {
        const testCount = await MockTest.countDocuments({ seriesId: s._id });
        return {
          ...s.toObject(),
          actualTestCount: testCount
        };
      })
    );

    console.log(`✅ Found ${series.length} mock test series`);
    res.status(200).json({
      success: true,
      series: seriesWithCounts,
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

// Create new mock test
const createTest = async (req, res) => {
  try {
    console.log('🆕 Creating new mock test');
    const { 
      title, 
      description, 
      seriesId, 
      duration, 
      sections, 
      instructions, 
      isFree, 
      difficulty 
    } = req.body;
    const adminId = req.user.id;

    // Get next test number in series
    const existingTestsCount = await MockTest.countDocuments({ seriesId });
    const testNumber = existingTestsCount + 1;

    // Calculate total questions and marks
    let totalQuestions = 0;
    let totalMarks = 0;

    sections.forEach(section => {
      totalQuestions += section.totalQuestions;
      totalMarks += section.totalMarks;
    });

    const test = new MockTest({
      title,
      description,
      seriesId,
      testNumber,
      duration,
      totalQuestions,
      totalMarks,
      sections,
      instructions,
      isFree: isFree || false,
      difficulty: difficulty || 'Medium',
      createdBy: adminId
    });

    await test.save();

    // Update series total tests count
    await MockTestSeries.findByIdAndUpdate(seriesId, {
      $inc: { totalTests: 1 }
    });

    console.log('✅ Mock test created successfully');
    res.status(201).json({
      success: true,
      message: 'Mock test created successfully',
      test
    });
  } catch (error) {
    console.error('❌ Error creating mock test:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create mock test',
      error: error.message
    });
  }
};

// Create new question
const createQuestion = async (req, res) => {
  try {
    console.log('🆕 Creating new mock test question');
    const {
      questionText,
      questionType,
      section,
      topic,
      passage,
      images,
      options,
      correctAnswer,
      explanation,
      marks,
      difficulty,
      tags
    } = req.body;
    const adminId = req.user.id;

    const question = new MockTestQuestion({
      questionText,
      questionType: questionType || 'MCQ',
      section,
      topic,
      passage,
      images: images || [],
      options: options || [],
      correctAnswer,
      explanation,
      marks: marks || { positive: 3, negative: -1 },
      difficulty: difficulty || 'Medium',
      tags: tags || [],
      createdBy: adminId
    });

    await question.save();

    console.log('✅ Mock test question created successfully');
    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      question
    });
  } catch (error) {
    console.error('❌ Error creating question:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create question',
      error: error.message
    });
  }
};

// Get questions for admin
const getQuestions = async (req, res) => {
  try {
    console.log('📚 Admin fetching questions');
    const { 
      page = 1, 
      limit = 10, 
      section, 
      topic, 
      difficulty, 
      search 
    } = req.query;

    const filter = { isActive: true };
    
    if (section && section !== 'all') {
      filter.section = section;
    }
    if (topic) {
      filter.topic = { $regex: topic, $options: 'i' };
    }
    if (difficulty && difficulty !== 'all') {
      filter.difficulty = difficulty;
    }
    if (search) {
      filter.$or = [
        { questionText: { $regex: search, $options: 'i' } },
        { topic: { $regex: search, $options: 'i' } }
      ];
    }

    const questions = await MockTestQuestion.find(filter)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await MockTestQuestion.countDocuments(filter);

    console.log(`✅ Found ${questions.length} questions`);
    res.status(200).json({
      success: true,
      questions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Error fetching questions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch questions',
      error: error.message
    });
  }
};

// Publish/Unpublish series
const toggleSeriesPublication = async (req, res) => {
  try {
    const { seriesId } = req.params;
    const { publish } = req.body;

    console.log(`📢 ${publish ? 'Publishing' : 'Unpublishing'} series: ${seriesId}`);

    const series = await MockTestSeries.findById(seriesId);
    if (!series) {
      return res.status(404).json({
        success: false,
        message: 'Mock test series not found'
      });
    }

    series.isPublished = publish;
    series.publishedAt = publish ? new Date() : null;
    await series.save();

    console.log(`✅ Series ${publish ? 'published' : 'unpublished'} successfully`);
    res.status(200).json({
      success: true,
      message: `Series ${publish ? 'published' : 'unpublished'} successfully`,
      series
    });
  } catch (error) {
    console.error('❌ Error toggling series publication:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update series publication status',
      error: error.message
    });
  }
};

// Publish/Unpublish test
const toggleTestPublication = async (req, res) => {
  try {
    const { testId } = req.params;
    const { publish } = req.body;

    console.log(`📢 ${publish ? 'Publishing' : 'Unpublishing'} test: ${testId}`);

    const test = await MockTest.findById(testId);
    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Mock test not found'
      });
    }

    test.isPublished = publish;
    test.publishedAt = publish ? new Date() : null;
    await test.save();

    console.log(`✅ Test ${publish ? 'published' : 'unpublished'} successfully`);
    res.status(200).json({
      success: true,
      message: `Test ${publish ? 'published' : 'unpublished'} successfully`,
      test
    });
  } catch (error) {
    console.error('❌ Error toggling test publication:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update test publication status',
      error: error.message
    });
  }
};

// Get test analytics
const getTestAnalytics = async (req, res) => {
  try {
    const { testId } = req.params;

    console.log(`📊 Fetching analytics for test: ${testId}`);

    const test = await MockTest.findById(testId).populate('seriesId', 'title');
    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    const attempts = await MockTestAttempt.find({ testId })
      .populate('studentId', 'name email');

    const analytics = {
      test: {
        title: test.title,
        series: test.seriesId.title,
        totalQuestions: test.totalQuestions,
        duration: test.duration
      },
      participation: {
        totalAttempts: attempts.length,
        completedAttempts: attempts.filter(a => a.isCompleted).length,
        averageScore: attempts.length > 0 ? 
          attempts.reduce((sum, a) => sum + a.score.total, 0) / attempts.length : 0,
        averageTime: attempts.length > 0 ?
          attempts.reduce((sum, a) => sum + a.timeSpent, 0) / attempts.length : 0
      },
      scoreDistribution: {
        excellent: attempts.filter(a => a.score.total >= 80).length,
        good: attempts.filter(a => a.score.total >= 60 && a.score.total < 80).length,
        average: attempts.filter(a => a.score.total >= 40 && a.score.total < 60).length,
        needsImprovement: attempts.filter(a => a.score.total < 40).length
      },
      recentAttempts: attempts.slice(0, 10)
    };

    console.log('✅ Analytics fetched successfully');
    res.status(200).json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('❌ Error fetching test analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch test analytics',
      error: error.message
    });
  }
};

module.exports = {
  createSeries,
  getAllSeries,
  createTest,
  createQuestion,
  getQuestions,
  toggleSeriesPublication,
  toggleTestPublication,
  getTestAnalytics
};
