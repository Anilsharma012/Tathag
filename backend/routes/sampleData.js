const express = require('express');
const router = express.Router();
const StudyMaterial = require('../models/StudyMaterial');
const Admin = require('../models/Admin');
const MockTestSeries = require('../models/MockTestSeries');
const MockTest = require('../models/MockTest');
const MockTestQuestion = require('../models/MockTestQuestion');

// Add sample study materials
router.post('/add-sample-materials', async (req, res) => {
  try {
    console.log('🚀 Adding sample study materials...');

    // Get first admin user
    const admin = await Admin.findOne();
    
    if (!admin) {
      return res.status(400).json({
        success: false,
        message: 'No admin user found. Please create an admin user first.'
      });
    }

    // Sample materials data
    const sampleMaterials = [
      {
        title: 'Quantitative Aptitude Formula Book',
        description: 'Complete formula book covering all topics of Quantitative Aptitude including Arithmetic, Algebra, Geometry, and Number Systems.',
        subject: 'Quantitative Aptitude',
        type: 'PDF',
        fileName: 'QA_Formula_Book.pdf',
        filePath: 'uploads/study-materials/sample-qa-formulas.txt',
        fileSize: '5.2 MB',
        tags: ['formulas', 'QA', 'reference', 'mathematics'],
        downloadCount: 1234,
        uploadedBy: admin._id,
        isActive: true
      },
      {
        title: 'Verbal Ability Video Lectures Series',
        description: 'Comprehensive video lecture series covering Reading Comprehension, Para Jumbles, Critical Reasoning, and Grammar.',
        subject: 'Verbal Ability',
        type: 'Video',
        fileName: 'VA_Video_Lectures.mp4',
        filePath: 'uploads/study-materials/sample-va-videos.txt',
        fileSize: '850 MB',
        tags: ['video', 'verbal', 'lectures', 'comprehension'],
        downloadCount: 856,
        uploadedBy: admin._id,
        isActive: true
      },
      {
        title: 'Data Interpretation Practice Sets',
        description: 'Collection of 50 practice sets for Data Interpretation covering Tables, Charts, Graphs, and Caselets.',
        subject: 'Data Interpretation',
        type: 'Practice Sets',
        fileName: 'DI_Practice_Sets.pdf',
        filePath: 'uploads/study-materials/sample-di-practice.txt',
        fileSize: '3.8 MB',
        tags: ['practice', 'DI', 'charts', 'graphs'],
        downloadCount: 945,
        uploadedBy: admin._id,
        isActive: true
      },
      {
        title: 'Logical Reasoning Shortcuts & Tricks',
        description: 'Quick shortcuts and time-saving tricks for solving Logical Reasoning questions efficiently.',
        subject: 'Logical Reasoning',
        type: 'Notes',
        fileName: 'LR_Shortcuts.pdf',
        filePath: 'uploads/study-materials/sample-lr-shortcuts.txt',
        fileSize: '2.1 MB',
        tags: ['shortcuts', 'tricks', 'logical reasoning', 'time-saving'],
        downloadCount: 672,
        uploadedBy: admin._id,
        isActive: true
      },
      {
        title: 'CAT Previous Year Papers (2010-2023)',
        description: 'Complete collection of CAT previous year question papers with detailed solutions and explanations.',
        subject: 'All Subjects',
        type: 'PDF',
        fileName: 'CAT_Previous_Papers.pdf',
        filePath: 'uploads/study-materials/sample-cat-papers.txt',
        fileSize: '12.5 MB',
        tags: ['previous papers', 'CAT', 'solutions', 'practice'],
        downloadCount: 2156,
        uploadedBy: admin._id,
        isActive: true
      },
      {
        title: 'Reading Comprehension Passages',
        description: 'Collection of high-quality Reading Comprehension passages from various topics with detailed explanations.',
        subject: 'Verbal Ability',
        type: 'PDF',
        fileName: 'RC_Passages.pdf',
        filePath: 'uploads/study-materials/sample-rc-passages.txt',
        fileSize: '7.3 MB',
        tags: ['reading comprehension', 'passages', 'verbal', 'practice'],
        downloadCount: 789,
        uploadedBy: admin._id,
        isActive: true
      },
      {
        title: 'Quantitative Aptitude Video Solutions',
        description: 'Video solutions for complex QA problems with step-by-step explanations and alternative methods.',
        subject: 'Quantitative Aptitude',
        type: 'Video',
        fileName: 'QA_Video_Solutions.mp4',
        filePath: 'uploads/study-materials/sample-qa-solutions.txt',
        fileSize: '1.2 GB',
        tags: ['video solutions', 'QA', 'problem solving', 'mathematics'],
        downloadCount: 543,
        uploadedBy: admin._id,
        isActive: true
      },
      {
        title: 'General Knowledge Current Affairs',
        description: 'Latest current affairs and general knowledge updates for competitive exam preparation.',
        subject: 'General Knowledge',
        type: 'PDF',
        fileName: 'GK_Current_Affairs.pdf',
        filePath: 'uploads/study-materials/sample-gk-current.txt',
        fileSize: '4.6 MB',
        tags: ['current affairs', 'GK', 'general knowledge', 'updates'],
        downloadCount: 421,
        uploadedBy: admin._id,
        isActive: true
      }
    ];

    // Clear existing materials to avoid duplicates
    await StudyMaterial.deleteMany({});
    console.log('🗑️ Cleared existing study materials');

    // Insert all materials
    const insertedMaterials = await StudyMaterial.insertMany(sampleMaterials);
    
    console.log(`✅ Successfully added ${insertedMaterials.length} study materials`);

    // Create summary
    const totalMaterials = await StudyMaterial.countDocuments();
    const bySubject = await StudyMaterial.aggregate([
      { $group: { _id: '$subject', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      message: `Successfully added ${insertedMaterials.length} study materials`,
      data: {
        totalMaterials,
        materialsBySubject: bySubject,
        materials: insertedMaterials
      }
    });

  } catch (error) {
    console.error('❌ Error adding sample materials:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding sample materials',
      error: error.message
    });
  }
});

// Get study materials count
router.get('/materials-count', async (req, res) => {
  try {
    const count = await StudyMaterial.countDocuments();
    const bySubject = await StudyMaterial.aggregate([
      { $group: { _id: '$subject', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalMaterials: count,
        materialsBySubject: bySubject
      }
    });
  } catch (error) {
    console.error('❌ Error getting materials count:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting materials count',
      error: error.message
    });
  }
});

// Add sample mock tests - GET endpoint for easy access
router.get('/create-mock-tests', async (req, res) => {
  try {
    console.log('🚀 Adding sample mock tests...');

    // Get first admin user
    let admin = await Admin.findOne();

    if (!admin) {
      return res.status(400).json({
        success: false,
        message: 'No admin user found. Please create an admin user first.'
      });
    }

    // Clear existing mock test data
    await MockTestQuestion.deleteMany({});
    await MockTest.deleteMany({});
    await MockTestSeries.deleteMany({});
    console.log('🗑️ Cleared existing mock test data');

    // Sample mock test series
    const sampleSeries = [
      {
        title: 'CAT 2026 Mock Test Series',
        description: 'Comprehensive mock test series designed as per the latest CAT pattern with detailed analysis and explanations.',
        category: 'CAT',
        freeTests: 3,
        price: 499,
        validity: 365,
        isPublished: true,
        isActive: true,
        tags: ['CAT', 'latest-pattern', 'comprehensive', 'analysis'],
        createdBy: admin._id,
        publishedAt: new Date()
      },
      {
        title: 'XAT 2026 Complete Series',
        description: 'Full-length XAT mock tests with decision-making and essay writing practice.',
        category: 'XAT',
        freeTests: 2,
        price: 399,
        validity: 365,
        isPublished: true,
        isActive: true,
        tags: ['XAT', 'decision-making', 'essay', 'complete'],
        createdBy: admin._id,
        publishedAt: new Date()
      },
      {
        title: 'Free CAT Practice Tests',
        description: 'Free mock tests for CAT preparation with basic analysis.',
        category: 'CAT',
        freeTests: 5,
        price: 0,
        validity: 180,
        isPublished: true,
        isActive: true,
        tags: ['free', 'practice', 'CAT', 'basic'],
        createdBy: admin._id,
        publishedAt: new Date()
      }
    ];

    // Create mock test series
    const createdSeries = await MockTestSeries.insertMany(sampleSeries);
    console.log(`✅ Created ${createdSeries.length} mock test series`);

    // Sample questions
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
        difficulty: 'Medium',
        createdBy: admin._id
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
        difficulty: 'Easy',
        createdBy: admin._id
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
        difficulty: 'Easy',
        createdBy: admin._id
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
        difficulty: 'Medium',
        createdBy: admin._id
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
        difficulty: 'Easy',
        createdBy: admin._id
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
        difficulty: 'Easy',
        createdBy: admin._id
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
        difficulty: 'Medium',
        createdBy: admin._id
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
        difficulty: 'Easy',
        createdBy: admin._id
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
        difficulty: 'Easy',
        createdBy: admin._id
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
        difficulty: 'Easy',
        createdBy: admin._id
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
        difficulty: 'Medium',
        createdBy: admin._id
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
        difficulty: 'Easy',
        createdBy: admin._id
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
        difficulty: 'Medium',
        createdBy: admin._id
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
        difficulty: 'Medium',
        createdBy: admin._id
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
        difficulty: 'Medium',
        createdBy: admin._id
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
        difficulty: 'Easy',
        createdBy: admin._id
      },
      {
        questionText: 'If CODING is written as DPEHJQ, how is FLOWER written?',
        questionType: 'MCQ',
        section: 'DILR',
        topic: 'Coding-Decoding',
        options: [
          { optionText: 'GMPXFS', isCorrect: true },
          { optionText: 'GMPFXS', isCorrect: false },
          { optionText: 'GMLWFS', isCorrect: false },
          { optionText: 'EMPWFR', isCorrect: false }
        ],
        correctAnswer: 'GMPXFS',
        explanation: 'Each letter is shifted by +1 in the alphabet. F→G, L→M, O→P, W→X, E→F, R→S.',
        marks: { positive: 3, negative: -1 },
        difficulty: 'Easy',
        createdBy: admin._id
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
        difficulty: 'Hard',
        createdBy: admin._id
      },
      {
        questionText: 'If today is Wednesday, what day will it be after 100 days?',
        questionType: 'MCQ',
        section: 'DILR',
        topic: 'Calendar',
        options: [
          { optionText: 'Friday', isCorrect: true },
          { optionText: 'Saturday', isCorrect: false },
          { optionText: 'Thursday', isCorrect: false },
          { optionText: 'Sunday', isCorrect: false }
        ],
        correctAnswer: 'Friday',
        explanation: '100 ÷ 7 = 14 remainder 2. So after 100 days, it will be 2 days after Wednesday, which is Friday.',
        marks: { positive: 3, negative: -1 },
        difficulty: 'Easy',
        createdBy: admin._id
      },
      {
        questionText: 'Select the missing number: 2, 6, 12, 20, 30, ?',
        questionType: 'MCQ',
        section: 'QA',
        topic: 'Number Patterns',
        options: [
          { optionText: '40', isCorrect: false },
          { optionText: '42', isCorrect: true },
          { optionText: '44', isCorrect: false },
          { optionText: '48', isCorrect: false }
        ],
        correctAnswer: '42',
        explanation: 'Pattern: n(n+1) where n = 1,2,3,4,5,6. So 6(6+1) = 6×7 = 42.',
        marks: { positive: 3, negative: -1 },
        difficulty: 'Medium',
        createdBy: admin._id
      },
      {
        questionText: 'The average of 5 numbers is 27. If one number is excluded, the average becomes 25. What is the excluded number?',
        questionType: 'MCQ',
        section: 'QA',
        topic: 'Averages',
        options: [
          { optionText: '35', isCorrect: true },
          { optionText: '32', isCorrect: false },
          { optionText: '30', isCorrect: false },
          { optionText: '37', isCorrect: false }
        ],
        correctAnswer: '35',
        explanation: 'Sum of 5 numbers = 27×5 = 135. Sum of 4 numbers = 25×4 = 100. Excluded number = 135-100 = 35.',
        marks: { positive: 3, negative: -1 },
        difficulty: 'Easy',
        createdBy: admin._id
      },
      {
        questionText: 'Choose the synonym of "EPHEMERAL":',
        questionType: 'MCQ',
        section: 'VARC',
        topic: 'Vocabulary',
        options: [
          { optionText: 'Permanent', isCorrect: false },
          { optionText: 'Temporary', isCorrect: true },
          { optionText: 'Eternal', isCorrect: false },
          { optionText: 'Lasting', isCorrect: false }
        ],
        correctAnswer: 'Temporary',
        explanation: 'Ephemeral means lasting for a very short time, which is synonymous with temporary.',
        marks: { positive: 3, negative: -1 },
        difficulty: 'Medium',
        createdBy: admin._id
      },
      {
        questionText: 'Find the error in the sentence: "Each of the students have submitted their assignments."',
        questionType: 'MCQ',
        section: 'VARC',
        topic: 'Grammar',
        options: [
          { optionText: 'have should be has', isCorrect: true },
          { optionText: 'their should be his', isCorrect: false },
          { optionText: 'students should be student', isCorrect: false },
          { optionText: 'No error', isCorrect: false }
        ],
        correctAnswer: 'have should be has',
        explanation: '"Each" is singular and requires the singular verb "has", not "have".',
        marks: { positive: 3, negative: -1 },
        difficulty: 'Easy',
        createdBy: admin._id
      }
    ];

    // Create questions
    const createdQuestions = await MockTestQuestion.insertMany(sampleQuestions);
    console.log(`✅ Created ${createdQuestions.length} sample questions`);

    // Sample mock tests for CAT series
    const catSeries = createdSeries.find(s => s.title.includes('CAT 2026'));
    const freeCatSeries = createdSeries.find(s => s.title.includes('Free CAT'));

    const sampleTests = [
      {
        title: 'CAT Mock Test 1 - Foundation Level',
        description: 'Foundation level mock test covering all three sections with moderate difficulty.',
        seriesId: catSeries._id,
        testNumber: 1,
        duration: 180,
        difficulty: 'Medium',
        isFree: true,
        isPublished: true,
        isActive: true,
        sections: [
          {
            name: 'VARC',
            duration: 60,
            totalQuestions: 8,
            totalMarks: 24,
            questions: createdQuestions.filter(q => q.section === 'VARC').map(q => q._id)
          },
          {
            name: 'DILR',
            duration: 60,
            totalQuestions: 6,
            totalMarks: 18,
            questions: createdQuestions.filter(q => q.section === 'DILR').map(q => q._id)
          },
          {
            name: 'QA',
            duration: 60,
            totalQuestions: 10,
            totalMarks: 30,
            questions: createdQuestions.filter(q => q.section === 'QA').map(q => q._id)
          }
        ],
        totalQuestions: 24,
        totalMarks: 72,
        positiveMarks: 3,
        negativeMarks: 1,
        createdBy: admin._id,
        publishedAt: new Date()
      },
      {
        title: 'CAT Mock Test 2 - Intermediate Level',
        description: 'Intermediate level mock test with increased difficulty and time pressure.',
        seriesId: catSeries._id,
        testNumber: 2,
        duration: 180,
        difficulty: 'Medium',
        isFree: true,
        isPublished: true,
        isActive: true,
        sections: [
          {
            name: 'VARC',
            duration: 60,
            totalQuestions: 8,
            totalMarks: 24,
            questions: createdQuestions.filter(q => q.section === 'VARC').map(q => q._id)
          },
          {
            name: 'DILR',
            duration: 60,
            totalQuestions: 6,
            totalMarks: 18,
            questions: createdQuestions.filter(q => q.section === 'DILR').map(q => q._id)
          },
          {
            name: 'QA',
            duration: 60,
            totalQuestions: 10,
            totalMarks: 30,
            questions: createdQuestions.filter(q => q.section === 'QA').map(q => q._id)
          }
        ],
        totalQuestions: 24,
        totalMarks: 72,
        positiveMarks: 3,
        negativeMarks: 1,
        createdBy: admin._id,
        publishedAt: new Date()
      },
      {
        title: 'Free CAT Practice Test 1',
        description: 'Free practice test for beginners.',
        seriesId: freeCatSeries._id,
        testNumber: 1,
        duration: 180,
        difficulty: 'Easy',
        isFree: true,
        isPublished: true,
        isActive: true,
        sections: [
          {
            name: 'VARC',
            duration: 60,
            totalQuestions: 8,
            totalMarks: 24,
            questions: createdQuestions.filter(q => q.section === 'VARC').map(q => q._id)
          },
          {
            name: 'DILR',
            duration: 60,
            totalQuestions: 6,
            totalMarks: 18,
            questions: createdQuestions.filter(q => q.section === 'DILR').map(q => q._id)
          },
          {
            name: 'QA',
            duration: 60,
            totalQuestions: 10,
            totalMarks: 30,
            questions: createdQuestions.filter(q => q.section === 'QA').map(q => q._id)
          }
        ],
        totalQuestions: 24,
        totalMarks: 72,
        positiveMarks: 3,
        negativeMarks: 1,
        createdBy: admin._id,
        publishedAt: new Date()
      }
    ];

    // Create mock tests
    const createdTests = await MockTest.insertMany(sampleTests);
    console.log(`✅ Created ${createdTests.length} mock tests`);

    // Update series with test counts
    await MockTestSeries.findByIdAndUpdate(catSeries._id, { totalTests: 2 });
    await MockTestSeries.findByIdAndUpdate(freeCatSeries._id, { totalTests: 1 });

    // Get summary
    const totalSeries = await MockTestSeries.countDocuments();
    const totalTests = await MockTest.countDocuments();
    const totalQuestions = await MockTestQuestion.countDocuments();

    res.status(200).json({
      success: true,
      message: 'Successfully created sample mock tests',
      data: {
        series: totalSeries,
        tests: totalTests,
        questions: totalQuestions,
        createdSeries: createdSeries.map(s => ({ id: s._id, title: s.title })),
        createdTests: createdTests.map(t => ({ id: t._id, title: t.title, seriesId: t.seriesId }))
      }
    });

  } catch (error) {
    console.error('❌ Error adding sample mock tests:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding sample mock tests',
      error: error.message
    });
  }
});

module.exports = router;
