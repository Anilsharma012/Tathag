const MockTest = require('../models/MockTest');
const MockTestQuestion = require('../models/MockTestQuestion');
const MockTestSeries = require('../models/MockTestSeries');

const createDemoData = async (req, res) => {
  try {
    console.log('🎯 Creating demo data for CAT exam...');

    // Check if demo data already exists
    const existingSeries = await MockTestSeries.findOne({ title: 'CAT Demo Series 2024' });
    if (existingSeries) {
      const message = 'Demo data already exists';
      console.log('✅', message);
      if (res && res.json) {
        return res.json({
          success: true,
          message,
          series: existingSeries
        });
      }
      return { success: true, message };
    }

    // Get first admin for createdBy field
    const Admin = require('../models/Admin');
    let admin = await Admin.findOne();

    if (!admin) {
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      admin = new Admin({
        name: 'Demo Admin',
        email: 'demo@admin.com',
        password: hashedPassword,
        phoneNumber: '1234567890'
      });
      await admin.save();
    }

    // Create demo series
    const series = new MockTestSeries({
      title: 'CAT Demo Series 2024',
      description: 'Complete CAT preparation with demo tests',
      category: 'CAT',
      price: 0,
      validity: 365,
      totalTests: 1,
      freeTests: 1,
      isActive: true,
      isPublished: true,
      enrolledStudents: [],
      createdBy: admin._id
    });
    await series.save();

    // Create demo questions
    const varcQuestions = [
      {
        questionText: "The passage below is accompanied by a set of questions. Choose the best answer to each question.\n\nCuttlefish are full of personality, as behavioral ecologist Alexandra Schnell found out while researching the cephalopod's potential to display self-control. Schnell, who is based at the University of Cambridge, spent months in 2019 training 29 European cuttlefish to approach a platform that would deliver food. But the individuals varied dramatically, she says. Some were \"very hesitant\" and took a long time to approach the platform or food at all, while others were \"very bold\" and didn't seem to care about anything.\n\nWhat was the primary purpose of Schnell's 2019 research with cuttlefish?",
        questionType: 'MCQ',
        section: 'VARC',
        options: [
          "To study cuttlefish personality variations",
          "To test cuttlefish self-control abilities", 
          "To compare cuttlefish intelligence with other species",
          "To develop new training methods for cephalopods"
        ],
        correctAnswer: "To test cuttlefish self-control abilities",
        marks: { positive: 3, negative: -1 }
      },
      {
        questionText: "Choose the word that is most similar in meaning to 'PERSPICACIOUS':",
        questionType: 'MCQ',
        section: 'VARC',
        options: [
          "Stubborn",
          "Insightful", 
          "Transparent",
          "Sweating"
        ],
        correctAnswer: "Insightful",
        marks: { positive: 3, negative: -1 }
      }
    ];

    const dilrQuestions = [
      {
        questionText: "Study the following data about sales of different products in a store:\n\nProduct A: 120 units in January, 15% increase in February\nProduct B: 80 units in January, 25% increase in February  \nProduct C: 200 units in January, 10% decrease in February\nProduct D: 150 units in January, 20% increase in February\n\nWhich product had the highest sales in February?",
        questionType: 'MCQ',
        section: 'DILR',
        options: [
          "Product A",
          "Product B", 
          "Product C",
          "Product D"
        ],
        correctAnswer: "Product D",
        marks: { positive: 3, negative: -1 }
      },
      {
        questionText: "In a coding system:\nCAT is coded as 24\nDOG is coded as 26\nBIRD is coded as 30\n\nWhat is the code for FISH?",
        questionType: 'MCQ',
        section: 'DILR',
        options: [
          "28",
          "32",
          "34", 
          "36"
        ],
        correctAnswer: "32",
        marks: { positive: 3, negative: -1 }
      }
    ];

    const qaQuestions = [
      {
        questionText: "If x² - 5x + 6 = 0, what are the possible values of x?",
        questionType: 'MCQ',
        section: 'QA',
        options: [
          "2 and 3",
          "1 and 6",
          "2 and 4", 
          "1 and 5"
        ],
        correctAnswer: "2 and 3",
        marks: { positive: 3, negative: -1 }
      },
      {
        questionText: "What is the value of log₂(32)?",
        questionType: 'MCQ',
        section: 'QA',
        options: [
          "4",
          "5",
          "6",
          "8"
        ],
        correctAnswer: "5",
        marks: { positive: 3, negative: -1 }
      }
    ];

    // Save all questions
    const allQuestions = [...varcQuestions, ...dilrQuestions, ...qaQuestions];
    const questionIds = {
      VARC: [],
      DILR: [],
      QA: []
    };

    for (const questionData of allQuestions) {
      const question = new MockTestQuestion(questionData);
      await question.save();
      questionIds[questionData.section].push(question._id);
    }

    // Create demo test
    const test = new MockTest({
      title: 'CAT Demo Test 2024',
      description: 'Sample CAT exam with real-style questions',
      seriesId: series._id,
      testNumber: 1,
      duration: 180,
      totalQuestions: allQuestions.length,
      totalMarks: allQuestions.length * 3,
      sections: [
        {
          name: 'VARC',
          duration: 60,
          totalQuestions: questionIds.VARC.length,
          questions: questionIds.VARC
        },
        {
          name: 'DILR',
          duration: 60,
          totalQuestions: questionIds.DILR.length,
          questions: questionIds.DILR
        },
        {
          name: 'QA',
          duration: 60,
          totalQuestions: questionIds.QA.length,
          questions: questionIds.QA
        }
      ],
      instructions: [
        'Read all instructions carefully before starting the test',
        'You have 180 minutes to complete all sections',
        'Each section has a time limit of 60 minutes',
        'Marking scheme: +3 for correct, -1 for incorrect, 0 for unattempted'
      ],
      isFree: true,
      isActive: true,
      isPublished: true,
      createdBy: admin._id
    });
    await test.save();

    const message = 'Demo data created successfully';
    console.log('✅', message);

    if (res && res.json) {
      return res.json({
        success: true,
        message,
        series,
        test,
        questionsCount: allQuestions.length
      });
    }

    return { success: true, message, questionsCount: allQuestions.length };

  } catch (error) {
    console.error('❌ Error creating demo data:', error);

    if (res && res.status) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create demo data',
        error: error.message
      });
    }

    return { success: false, message: 'Failed to create demo data', error: error.message };
  }
};

module.exports = {
  createDemoData
};
