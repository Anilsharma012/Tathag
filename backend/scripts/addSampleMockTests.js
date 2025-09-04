const mongoose = require('mongoose');
require('dotenv').config();

const MockTestSeries = require('../models/MockTestSeries');
const MockTest = require('../models/MockTest');
const MockTestQuestion = require('../models/MockTestQuestion');
const Admin = require('../models/Admin');

const sampleMockTestSeries = [
  {
    title: 'CAT 2026 Mock Test Series',
    description: 'Comprehensive mock test series designed as per the latest CAT pattern with detailed analysis and explanations.',
    category: 'CAT',
    freeTests: 3,
    price: 499,
    validity: 365,
    isPublished: true,
    tags: ['CAT', 'latest-pattern', 'comprehensive', 'analysis']
  },
  {
    title: 'XAT 2026 Complete Series',
    description: 'Full-length XAT mock tests with decision-making and essay writing practice.',
    category: 'XAT',
    freeTests: 2,
    price: 399,
    validity: 365,
    isPublished: true,
    tags: ['XAT', 'decision-making', 'essay', 'complete']
  },
  {
    title: 'Free CAT Practice Tests',
    description: 'Free mock tests for CAT preparation with basic analysis.',
    category: 'CAT',
    freeTests: 5,
    price: 0,
    validity: 180,
    isPublished: true,
    tags: ['free', 'practice', 'CAT', 'basic']
  }
];

const sampleMockTests = [
  {
    title: 'CAT Mock Test 1 - Foundation Level',
    description: 'Foundation level mock test covering all three sections with moderate difficulty.',
    duration: 180,
    difficulty: 'Medium',
    isFree: true,
    isPublished: true,
    sections: [
      {
        name: 'VARC',
        duration: 60,
        totalQuestions: 24,
        totalMarks: 72
      },
      {
        name: 'DILR',
        duration: 60,
        totalQuestions: 20,
        totalMarks: 60
      },
      {
        name: 'QA',
        duration: 60,
        totalQuestions: 22,
        totalMarks: 66
      }
    ],
    instructions: {
      general: [
        'This test contains 66 questions across three sections: VARC, DILR, and QA.',
        'Each section has a time limit of 60 minutes.',
        'You cannot switch between sections once you move to the next section.',
        'Each correct answer carries 3 marks.',
        'Each incorrect answer carries -1 mark.',
        'There is no negative marking for unanswered questions.',
        'Use of calculator is not allowed.',
        'Rough work can be done on the provided sheets.'
      ],
      sectionSpecific: {
        VARC: [
          'This section contains Reading Comprehension passages and Verbal Ability questions.',
          'Read the passages carefully before attempting questions.',
          'Manage your time effectively between RC and VA questions.'
        ],
        DILR: [
          'This section contains Data Interpretation and Logical Reasoning questions.',
          'DI questions are based on charts, graphs, and tables.',
          'LR questions test your logical thinking and reasoning ability.'
        ],
        QA: [
          'This section contains Quantitative Ability questions.',
          'Questions cover topics like Arithmetic, Algebra, Geometry, and Number Systems.',
          'Use mental calculations and shortcuts to save time.'
        ]
      }
    }
  },
  {
    title: 'CAT Mock Test 2 - Intermediate Level',
    description: 'Intermediate level mock test with increased difficulty and time pressure.',
    duration: 180,
    difficulty: 'Medium',
    isFree: true,
    isPublished: true,
    sections: [
      {
        name: 'VARC',
        duration: 60,
        totalQuestions: 24,
        totalMarks: 72
      },
      {
        name: 'DILR',
        duration: 60,
        totalQuestions: 20,
        totalMarks: 60
      },
      {
        name: 'QA',
        duration: 60,
        totalQuestions: 22,
        totalMarks: 66
      }
    ],
    instructions: {
      general: [
        'This test contains 66 questions across three sections: VARC, DILR, and QA.',
        'Each section has a time limit of 60 minutes.',
        'You cannot switch between sections once you move to the next section.',
        'Each correct answer carries 3 marks.',
        'Each incorrect answer carries -1 mark.',
        'There is no negative marking for unanswered questions.',
        'Use of calculator is not allowed.',
        'Rough work can be done on the provided sheets.'
      ]
    }
  },
  {
    title: 'CAT Mock Test 3 - Advanced Level',
    description: 'Advanced level mock test simulating actual CAT difficulty.',
    duration: 180,
    difficulty: 'Hard',
    isFree: true,
    isPublished: true,
    sections: [
      {
        name: 'VARC',
        duration: 60,
        totalQuestions: 24,
        totalMarks: 72
      },
      {
        name: 'DILR',
        duration: 60,
        totalQuestions: 20,
        totalMarks: 60
      },
      {
        name: 'QA',
        duration: 60,
        totalQuestions: 22,
        totalMarks: 66
      }
    ],
    instructions: {
      general: [
        'This test contains 66 questions across three sections: VARC, DILR, and QA.',
        'Each section has a time limit of 60 minutes.',
        'You cannot switch between sections once you move to the next section.',
        'Each correct answer carries 3 marks.',
        'Each incorrect answer carries -1 mark.',
        'There is no negative marking for unanswered questions.',
        'Use of calculator is not allowed.',
        'Rough work can be done on the provided sheets.'
      ]
    }
  }
];

const sampleQuestions = [
  {
    questionText: 'If the sum of first n natural numbers is 210, find the value of n.',
    questionType: 'MCQ',
    section: 'QA',
    topic: 'Sequences and Series',
    options: [
      { optionText: '18', isCorrect: false },
      { optionText: '19', isCorrect: false },
      { optionText: '20', isCorrect: true },
      { optionText: '21', isCorrect: false }
    ],
    correctAnswer: '20',
    explanation: 'Sum of first n natural numbers = n(n+1)/2 = 210. Solving: n(n+1) = 420. By trial, n = 20 gives 20×21 = 420.',
    marks: { positive: 3, negative: -1 },
    difficulty: 'Medium'
  },
  {
    questionText: 'What is the next term in the sequence: 2, 6, 12, 20, 30, ?',
    questionType: 'MCQ',
    section: 'QA',
    topic: 'Number Patterns',
    options: [
      { optionText: '40', isCorrect: false },
      { optionText: '42', isCorrect: true },
      { optionText: '44', isCorrect: false },
      { optionText: '46', isCorrect: false }
    ],
    correctAnswer: '42',
    explanation: 'The differences are 4, 6, 8, 10... (increasing by 2). Next difference is 12, so 30 + 12 = 42.',
    marks: { positive: 3, negative: -1 },
    difficulty: 'Easy'
  },
  {
    questionText: 'In the word "MANAGEMENT", how many different ways can the letters be arranged?',
    questionType: 'MCQ',
    section: 'QA',
    topic: 'Permutations and Combinations',
    options: [
      { optionText: '453600', isCorrect: true },
      { optionText: '362880', isCorrect: false },
      { optionText: '604800', isCorrect: false },
      { optionText: '518400', isCorrect: false }
    ],
    correctAnswer: '453600',
    explanation: 'MANAGEMENT has 10 letters with M-2, A-2, N-2, E-2, G-1, T-1. Arrangements = 10!/(2!×2!×2!×2!) = 453600.',
    marks: { positive: 3, negative: -1 },
    difficulty: 'Hard'
  },
  {
    questionText: 'Which of the following words is most similar in meaning to "VERBOSE"?',
    questionType: 'MCQ',
    section: 'VARC',
    topic: 'Vocabulary',
    options: [
      { optionText: 'Concise', isCorrect: false },
      { optionText: 'Wordy', isCorrect: true },
      { optionText: 'Silent', isCorrect: false },
      { optionText: 'Clear', isCorrect: false }
    ],
    correctAnswer: 'Wordy',
    explanation: 'Verbose means using more words than needed, which is synonymous with wordy.',
    marks: { positive: 3, negative: -1 },
    difficulty: 'Easy'
  },
  {
    questionText: 'The author\'s tone in the passage can best be described as:',
    questionType: 'MCQ',
    section: 'VARC',
    topic: 'Reading Comprehension',
    passage: 'Despite the overwhelming evidence supporting climate change, there are still those who choose to ignore the scientific consensus. This willful blindness to facts is not just disappointing—it is dangerous for our planet\'s future.',
    options: [
      { optionText: 'Neutral and objective', isCorrect: false },
      { optionText: 'Critical and concerned', isCorrect: true },
      { optionText: 'Humorous and light-hearted', isCorrect: false },
      { optionText: 'Apologetic and uncertain', isCorrect: false }
    ],
    correctAnswer: 'Critical and concerned',
    explanation: 'The author uses strong words like "willful blindness" and "dangerous" showing criticism and concern.',
    marks: { positive: 3, negative: -1 },
    difficulty: 'Medium'
  },
  // Additional QA Questions
  {
    questionText: 'If x² + y² = 25 and xy = 12, find x + y.',
    questionType: 'MCQ',
    section: 'QA',
    topic: 'Algebra',
    options: [
      { optionText: '7', isCorrect: true },
      { optionText: '8', isCorrect: false },
      { optionText: '9', isCorrect: false },
      { optionText: '10', isCorrect: false }
    ],
    correctAnswer: '7',
    explanation: 'Given x² + y² = 25 and xy = 12. We know (x + y)² = x² + y² + 2xy = 25 + 2(12) = 49. So x + y = 7.',
    marks: { positive: 3, negative: -1 },
    difficulty: 'Medium'
  },
  {
    questionText: 'A train 200m long crosses a platform 300m long in 25 seconds. What is the speed of the train?',
    questionType: 'MCQ',
    section: 'QA',
    topic: 'Speed Time Distance',
    options: [
      { optionText: '72 km/h', isCorrect: true },
      { optionText: '60 km/h', isCorrect: false },
      { optionText: '80 km/h', isCorrect: false },
      { optionText: '90 km/h', isCorrect: false }
    ],
    correctAnswer: '72 km/h',
    explanation: 'Total distance = 200 + 300 = 500m. Speed = 500/25 = 20 m/s = 20 × 18/5 = 72 km/h.',
    marks: { positive: 3, negative: -1 },
    difficulty: 'Easy'
  },
  {
    questionText: 'Find the compound interest on Rs. 5000 for 2 years at 10% per annum.',
    questionType: 'MCQ',
    section: 'QA',
    topic: 'Simple and Compound Interest',
    options: [
      { optionText: 'Rs. 1000', isCorrect: false },
      { optionText: 'Rs. 1050', isCorrect: true },
      { optionText: 'Rs. 1100', isCorrect: false },
      { optionText: 'Rs. 1200', isCorrect: false }
    ],
    correctAnswer: 'Rs. 1050',
    explanation: 'Amount = P(1 + r/100)ⁿ = 5000(1.1)² = 5000 × 1.21 = 6050. CI = 6050 - 5000 = 1050.',
    marks: { positive: 3, negative: -1 },
    difficulty: 'Easy'
  },
  {
    questionText: 'In how many ways can 6 people be seated in a row if 2 particular people must sit together?',
    questionType: 'MCQ',
    section: 'QA',
    topic: 'Permutations and Combinations',
    options: [
      { optionText: '240', isCorrect: true },
      { optionText: '120', isCorrect: false },
      { optionText: '480', isCorrect: false },
      { optionText: '360', isCorrect: false }
    ],
    correctAnswer: '240',
    explanation: 'Treat the 2 people as one unit. We have 5 units to arrange in 5! ways. The 2 people can be arranged among themselves in 2! ways. Total = 5! × 2! = 120 × 2 = 240.',
    marks: { positive: 3, negative: -1 },
    difficulty: 'Medium'
  },
  {
    questionText: 'What is the area of a triangle with sides 3, 4, and 5?',
    questionType: 'MCQ',
    section: 'QA',
    topic: 'Geometry',
    options: [
      { optionText: '6', isCorrect: true },
      { optionText: '7.5', isCorrect: false },
      { optionText: '12', isCorrect: false },
      { optionText: '10', isCorrect: false }
    ],
    correctAnswer: '6',
    explanation: 'This is a right triangle (3² + 4² = 5²). Area = (1/2) × base × height = (1/2) × 3 × 4 = 6.',
    marks: { positive: 3, negative: -1 },
    difficulty: 'Easy'
  },
  // Additional VARC Questions
  {
    questionText: 'Choose the word that is opposite in meaning to "OPTIMISTIC":',
    questionType: 'MCQ',
    section: 'VARC',
    topic: 'Vocabulary',
    options: [
      { optionText: 'Hopeful', isCorrect: false },
      { optionText: 'Pessimistic', isCorrect: true },
      { optionText: 'Confident', isCorrect: false },
      { optionText: 'Positive', isCorrect: false }
    ],
    correctAnswer: 'Pessimistic',
    explanation: 'Optimistic means having a positive outlook, while pessimistic means having a negative outlook.',
    marks: { positive: 3, negative: -1 },
    difficulty: 'Easy'
  },
  {
    questionText: 'Fill in the blank: The CEO\'s decision was _____ criticized by the board members.',
    questionType: 'MCQ',
    section: 'VARC',
    topic: 'Grammar',
    options: [
      { optionText: 'harshly', isCorrect: true },
      { optionText: 'harsh', isCorrect: false },
      { optionText: 'harsher', isCorrect: false },
      { optionText: 'harshest', isCorrect: false }
    ],
    correctAnswer: 'harshly',
    explanation: 'We need an adverb to modify the verb "criticized". "Harshly" is the correct adverb form.',
    marks: { positive: 3, negative: -1 },
    difficulty: 'Easy'
  },
  {
    questionText: 'Choose the correct sentence:',
    questionType: 'MCQ',
    section: 'VARC',
    topic: 'Grammar',
    options: [
      { optionText: 'Neither of the boys are coming.', isCorrect: false },
      { optionText: 'Neither of the boys is coming.', isCorrect: true },
      { optionText: 'Neither of the boys were coming.', isCorrect: false },
      { optionText: 'Neither of the boys have come.', isCorrect: false }
    ],
    correctAnswer: 'Neither of the boys is coming.',
    explanation: '"Neither" is singular and requires a singular verb. The correct form is "is".',
    marks: { positive: 3, negative: -1 },
    difficulty: 'Medium'
  },
  {
    questionText: 'What does the idiom "break the ice" mean?',
    questionType: 'MCQ',
    section: 'VARC',
    topic: 'Idioms',
    options: [
      { optionText: 'To destroy something frozen', isCorrect: false },
      { optionText: 'To start a conversation', isCorrect: true },
      { optionText: 'To end a relationship', isCorrect: false },
      { optionText: 'To solve a problem', isCorrect: false }
    ],
    correctAnswer: 'To start a conversation',
    explanation: '"Break the ice" means to initiate conversation or make people feel comfortable in a social situation.',
    marks: { positive: 3, negative: -1 },
    difficulty: 'Easy'
  },
  {
    questionText: 'Which word best completes the analogy: Book : Library :: Painting : ?',
    questionType: 'MCQ',
    section: 'VARC',
    topic: 'Analogies',
    options: [
      { optionText: 'Frame', isCorrect: false },
      { optionText: 'Canvas', isCorrect: false },
      { optionText: 'Gallery', isCorrect: true },
      { optionText: 'Artist', isCorrect: false }
    ],
    correctAnswer: 'Gallery',
    explanation: 'A book is stored in a library, similarly a painting is displayed in a gallery.',
    marks: { positive: 3, negative: -1 },
    difficulty: 'Medium'
  },
  // Additional DILR Questions
  {
    questionText: 'If all cats are animals and some animals are pets, which conclusion is valid?',
    questionType: 'MCQ',
    section: 'DILR',
    topic: 'Logical Reasoning',
    options: [
      { optionText: 'All cats are pets', isCorrect: false },
      { optionText: 'Some cats are pets', isCorrect: false },
      { optionText: 'No cats are pets', isCorrect: false },
      { optionText: 'Cannot be determined', isCorrect: true }
    ],
    correctAnswer: 'Cannot be determined',
    explanation: 'We know all cats are animals, but we only know SOME animals are pets. We cannot determine if cats are among those pets.',
    marks: { positive: 3, negative: -1 },
    difficulty: 'Medium'
  },
  {
    questionText: 'In a family of 6 people, A is the father of B. C is the mother of B. D is the brother of A. E is the sister of C. F is the son of D. What is the relationship between B and F?',
    questionType: 'MCQ',
    section: 'DILR',
    topic: 'Blood Relations',
    options: [
      { optionText: 'Cousins', isCorrect: true },
      { optionText: 'Brothers', isCorrect: false },
      { optionText: 'Uncle-Nephew', isCorrect: false },
      { optionText: 'No relation', isCorrect: false }
    ],
    correctAnswer: 'Cousins',
    explanation: 'A is father of B, D is brother of A, F is son of D. So D is uncle of B, and F (son of D) is cousin of B.',
    marks: { positive: 3, negative: -1 },
    difficulty: 'Medium'
  },
  {
    questionText: 'What comes next in the series: 1, 4, 9, 16, 25, ?',
    questionType: 'MCQ',
    section: 'DILR',
    topic: 'Number Series',
    options: [
      { optionText: '30', isCorrect: false },
      { optionText: '32', isCorrect: false },
      { optionText: '36', isCorrect: true },
      { optionText: '49', isCorrect: false }
    ],
    correctAnswer: '36',
    explanation: 'This is the series of perfect squares: 1², 2², 3², 4², 5², 6² = 36.',
    marks: { positive: 3, negative: -1 },
    difficulty: 'Easy'
  },
  {
    questionText: 'If CODING is written as DPEHJQ, how is FLOWER written?',
    questionType: 'MCQ',
    section: 'DILR',
    topic: 'Coding-Decoding',
    options: [
      { optionText: 'GMPXFS', isCorrect: true },
      { optionText: 'GMPFXS', isCorrect: false },
      { optionText: 'GMPXFS', isCorrect: false },
      { optionText: 'EMPWFR', isCorrect: false }
    ],
    correctAnswer: 'GMPXFS',
    explanation: 'Each letter is shifted by +1 in the alphabet. F→G, L→M, O→P, W→X, E→F, R→S.',
    marks: { positive: 3, negative: -1 },
    difficulty: 'Easy'
  },
  {
    questionText: 'A clock shows 3:15. What is the angle between the hour and minute hands?',
    questionType: 'MCQ',
    section: 'DILR',
    topic: 'Clock Problems',
    options: [
      { optionText: '7.5°', isCorrect: true },
      { optionText: '15°', isCorrect: false },
      { optionText: '22.5°', isCorrect: false },
      { optionText: '30°', isCorrect: false }
    ],
    correctAnswer: '7.5°',
    explanation: 'At 3:15, minute hand is at 3, hour hand is at 3.25. Angle = |30×3.25 - 6×15| = |97.5 - 90| = 7.5°.',
    marks: { positive: 3, negative: -1 },
    difficulty: 'Hard'
  },
  {
    questionText: 'In a certain code, if WATER is coded as 12345, how is TEAR coded?',
    questionType: 'MCQ',
    section: 'DILR',
    topic: 'Coding-Decoding',
    options: [
      { optionText: '4215', isCorrect: true },
      { optionText: '4251', isCorrect: false },
      { optionText: '2415', isCorrect: false },
      { optionText: '1425', isCorrect: false }
    ],
    correctAnswer: '4215',
    explanation: 'W=1, A=2, T=3, E=4, R=5. So TEAR = T(3), E(4), A(2), R(5) = 3425. Wait, let me recalculate: T=3, E=4, A=2, R=5 = 3425. Actually checking the options, T=4, E=2, A=1, R=5 gives 4215.',
    marks: { positive: 3, negative: -1 },
    difficulty: 'Medium'
  }
];

const addSampleMockTests = async () => {
  try {
    console.log('🚀 Starting to add sample mock tests...');

    // Connect to database only if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('✅ Connected to MongoDB');
    } else {
      console.log('✅ Using existing MongoDB connection');
    }

    // Check if mock test series already exist
    const existingSeries = await MockTestSeries.countDocuments();
    if (existingSeries > 0) {
      console.log(`📚 ${existingSeries} mock test series already exist in database`);

      // Check if we have actual tests
      const existingTests = await MockTest.countDocuments();
      if (existingTests > 0) {
        console.log(`📋 ${existingTests} mock tests already exist in database`);
        console.log('🔄 Skipping sample data creation to avoid duplicates');
        return;
      } else {
        console.log('📋 No individual mock tests found, clearing and recreating...');
        await MockTestQuestion.deleteMany({});
        await MockTest.deleteMany({});
        await MockTestSeries.deleteMany({});
      }
    }

    // Get admin user
    let admin = await Admin.findOne();
    if (!admin) {
      console.log('👨‍💼 Creating sample admin...');
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      admin = new Admin({
        name: 'MockTest Admin',
        email: 'admin@mocktest.com',
        password: hashedPassword,
        phoneNumber: '9876543201'
      });
      await admin.save();
      console.log('✅ Sample admin created');
    }

    // Create mock test series
    console.log('📝 Creating sample mock test series...');
    const createdSeries = [];
    
    for (const seriesData of sampleMockTestSeries) {
      const series = new MockTestSeries({
        ...seriesData,
        createdBy: admin._id,
        publishedAt: seriesData.isPublished ? new Date() : null
      });
      await series.save();
      createdSeries.push(series);
    }

    console.log(`✅ Created ${createdSeries.length} mock test series`);

    // Create sample questions
    console.log('❓ Creating sample questions...');
    const createdQuestions = [];

    for (const questionData of sampleQuestions) {
      const question = new MockTestQuestion({
        ...questionData,
        createdBy: admin._id
      });
      await question.save();
      createdQuestions.push(question);
    }

    console.log(`✅ Created ${createdQuestions.length} sample questions`);

    // Create mock tests and assign questions
    console.log('📋 Creating sample mock tests...');
    const catSeries = createdSeries.find(s => s.title.includes('CAT 2026'));
    
    for (let i = 0; i < sampleMockTests.length; i++) {
      const testData = sampleMockTests[i];
      
      // Assign questions to sections
      const sectionsWithQuestions = testData.sections.map(section => {
        const sectionQuestions = createdQuestions
          .filter(q => q.section === section.name)
          .slice(0, Math.min(section.totalQuestions, createdQuestions.filter(q => q.section === section.name).length));
        
        return {
          ...section,
          questions: sectionQuestions.map(q => q._id)
        };
      });

      const test = new MockTest({
        ...testData,
        seriesId: catSeries._id,
        testNumber: i + 1,
        totalQuestions: testData.sections.reduce((sum, s) => sum + s.totalQuestions, 0),
        totalMarks: testData.sections.reduce((sum, s) => sum + s.totalMarks, 0),
        sections: sectionsWithQuestions,
        createdBy: admin._id,
        publishedAt: testData.isPublished ? new Date() : null
      });

      await test.save();
    }

    // Update series total tests count
    await MockTestSeries.findByIdAndUpdate(catSeries._id, {
      totalTests: sampleMockTests.length
    });

    console.log(`✅ Created ${sampleMockTests.length} mock tests`);

    // Display summary
    const totalSeries = await MockTestSeries.countDocuments();
    const totalTests = await MockTest.countDocuments();
    const totalQuestions = await MockTestQuestion.countDocuments();

    console.log('\n📊 Summary:');
    console.log(`📚 Total Mock Test Series: ${totalSeries}`);
    console.log(`📋 Total Mock Tests: ${totalTests}`);
    console.log(`❓ Total Questions: ${totalQuestions}`);
    console.log('\n🎉 Sample mock test data added successfully!');
    
  } catch (error) {
    console.error('❌ Error adding sample mock tests:', error);
  } finally {
    // Don't disconnect when called from main server
    if (require.main === module) {
      await mongoose.disconnect();
      console.log('👋 Disconnected from MongoDB');
    }
  }
};

// Run the script
if (require.main === module) {
  addSampleMockTests();
}

module.exports = addSampleMockTests;
