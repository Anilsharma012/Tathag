const mongoose = require('mongoose');
const MockTest = require('../models/MockTest');
const MockTestQuestion = require('../models/MockTestQuestion');
const MockTestSeries = require('../models/MockTestSeries');
require('../dbConnection');

const createDemoQuestions = async () => {
  try {
    console.log('🎯 Creating demo questions for CAT exam...');

    // Find an existing mock test series
    let series = await MockTestSeries.findOne({ category: 'CAT' });
    if (!series) {
      // Create a demo series
      series = new MockTestSeries({
        title: 'CAT Demo Series 2024',
        description: 'Complete CAT preparation with demo tests',
        category: 'CAT',
        price: 0,
        validity: 365,
        totalTests: 1,
        freeTests: 1,
        isActive: true,
        isPublished: true,
        enrolledStudents: []
      });
      await series.save();
      console.log('✅ Created demo series');
    }

    // Find or create a demo test
    let test = await MockTest.findOne({ seriesId: series._id });
    if (!test) {
      test = new MockTest({
        title: 'CAT Demo Test 2024',
        description: 'Sample CAT exam with real-style questions',
        seriesId: series._id,
        testNumber: 1,
        duration: 180, // 3 hours
        totalQuestions: 66,
        totalMarks: 198,
        sections: [
          {
            name: 'VARC',
            duration: 60,
            totalQuestions: 24,
            questions: []
          },
          {
            name: 'DILR', 
            duration: 60,
            totalQuestions: 20,
            questions: []
          },
          {
            name: 'QA',
            duration: 60,
            totalQuestions: 22,
            questions: []
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
        isPublished: true
      });
      await test.save();
      console.log('✅ Created demo test');
    }

    // Create VARC questions
    const varcQuestions = [];
    
    // Reading Comprehension passage with questions
    const rcQuestions = [
      {
        questionText: "The passage below is accompanied by a set of questions. Choose the best answer to each question.\n\nCuttlefish are full of personality, as behavioral ecologist Alexandra Schnell found out while researching the cephalopod's potential to display self-control. Schnell, who is based at the University of Cambridge, spent months in 2019 training 29 European cuttlefish to approach a platform that would deliver food. But the individuals varied dramatically, she says. Some were \"very hesitant\" and took a long time to approach the platform or food at all, while others were \"very bold\" and didn't seem to care about anything.\n\nCuttlefish are highly intelligent invertebrates that have even passed the \"marshmallow test\" - a delayed gratification task that involves waiting for a better reward instead of taking an immediate, less valuable one. The cuttlefish version of the test is more like a fishing trip: the cuttlefish see two different foods, one they can get immediately and one they have to wait for. If they can resist the immediate food, they get the better option later.\n\nWhat was the primary purpose of Schnell's 2019 research with cuttlefish?",
        questionType: 'MCQ',
        section: 'VARC',
        options: [
          "To study cuttlefish personality variations",
          "To test cuttlefish self-control abilities", 
          "To compare cuttlefish intelligence with other species",
          "To develop new training methods for cephalopods"
        ],
        correctAnswer: "To test cuttlefish self-control abilities",
        marks: { positive: 3, negative: -1 },
        images: []
      },
      {
        questionText: "Based on the passage, which statement about the 'marshmallow test' for cuttlefish is most accurate?",
        questionType: 'MCQ',
        section: 'VARC',
        options: [
          "It exactly replicates the human marshmallow test procedure",
          "It involves choosing between two types of food with different timing",
          "It tests the cuttlefish's ability to catch food while fishing",
          "It measures how long cuttlefish can wait without any reward"
        ],
        correctAnswer: "It involves choosing between two types of food with different timing",
        marks: { positive: 3, negative: -1 },
        images: []
      },
      {
        questionText: "The author's description of cuttlefish personalities suggests that:",
        questionType: 'MCQ',
        section: 'VARC',
        options: [
          "All cuttlefish behave identically in experimental settings",
          "Personality differences affect how cuttlefish respond to training",
          "Bold cuttlefish perform better on intelligence tests",
          "Hesitant cuttlefish are less intelligent than bold ones"
        ],
        correctAnswer: "Personality differences affect how cuttlefish respond to training",
        marks: { positive: 3, negative: -1 },
        images: []
      },
      {
        questionText: "Which of the following can be inferred about cuttlefish intelligence from the passage?",
        questionType: 'MCQ',
        section: 'VARC',
        options: [
          "It is limited compared to vertebrate intelligence",
          "It includes complex decision-making abilities",
          "It is primarily focused on food acquisition",
          "It varies significantly between individual cuttlefish"
        ],
        correctAnswer: "It includes complex decision-making abilities",
        marks: { positive: 3, negative: -1 },
        images: []
      }
    ];

    // Verbal questions
    const verbalQuestions = [
      {
        questionText: "In the following sentence, identify the part that contains an error:\n'Neither the students nor the teacher were aware of the new policy that was implemented last week.'",
        questionType: 'MCQ',
        section: 'VARC',
        options: [
          "Neither the students nor the teacher",
          "were aware of the new policy",
          "that was implemented",
          "last week"
        ],
        correctAnswer: "were aware of the new policy",
        marks: { positive: 3, negative: -1 },
        images: []
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
        marks: { positive: 3, negative: -1 },
        images: []
      },
      {
        questionText: "Complete the analogy: BOOK : LIBRARY :: PAINTING : ?",
        questionType: 'MCQ',
        section: 'VARC',
        options: [
          "Frame",
          "Artist",
          "Gallery",
          "Canvas"
        ],
        correctAnswer: "Gallery", 
        marks: { positive: 3, negative: -1 },
        images: []
      }
    ];

    varcQuestions.push(...rcQuestions, ...verbalQuestions);

    // Create DILR questions
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
        marks: { positive: 3, negative: -1 },
        images: []
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
        marks: { positive: 3, negative: -1 },
        images: []
      },
      {
        questionText: "Six friends - A, B, C, D, E, and F - are sitting around a circular table. A is sitting opposite to D. B is sitting between A and C. E is sitting to the immediate left of F. If C is sitting opposite to F, who is sitting to the immediate right of A?",
        questionType: 'MCQ',
        section: 'DILR',
        options: [
          "B",
          "C",
          "E",
          "F"
        ],
        correctAnswer: "E",
        marks: { positive: 3, negative: -1 },
        images: []
      },
      {
        questionText: "A train travels from city X to city Y at 60 km/h and returns at 40 km/h. If the total journey time is 5 hours, what is the distance between the two cities?",
        questionType: 'MCQ',
        section: 'DILR',
        options: [
          "100 km",
          "120 km",
          "150 km",
          "200 km"
        ],
        correctAnswer: "120 km",
        marks: { positive: 3, negative: -1 },
        images: []
      }
    ];

    // Create QA questions  
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
        marks: { positive: 3, negative: -1 },
        images: []
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
        marks: { positive: 3, negative: -1 },
        images: []
      },
      {
        questionText: "In a right triangle, if one angle is 30°, what is the ratio of the sides opposite to the 30° and 60° angles?",
        questionType: 'MCQ',
        section: 'QA',
        options: [
          "1:2",
          "1:√3",
          "√3:2",
          "1:√2"
        ],
        correctAnswer: "1:√3",
        marks: { positive: 3, negative: -1 },
        images: []
      },
      {
        questionText: "If the compound interest on ₹1000 for 2 years at 10% per annum is ₹210, what would be the simple interest for the same amount, rate and time?",
        questionType: 'MCQ',
        section: 'QA',
        options: [
          "₹180",
          "₹190",
          "₹200",
          "₹220"
        ],
        correctAnswer: "₹200",
        marks: { positive: 3, negative: -1 },
        images: []
      }
    ];

    // Save all questions
    const allQuestions = [...varcQuestions, ...dilrQuestions, ...qaQuestions];
    
    for (const questionData of allQuestions) {
      const existingQuestion = await MockTestQuestion.findOne({
        questionText: questionData.questionText
      });
      
      if (!existingQuestion) {
        const question = new MockTestQuestion(questionData);
        await question.save();
        
        // Add question to appropriate section
        const sectionIndex = test.sections.findIndex(s => s.name === questionData.section);
        if (sectionIndex !== -1) {
          test.sections[sectionIndex].questions.push(question._id);
        }
      }
    }

    // Update test with question counts
    test.sections[0].totalQuestions = varcQuestions.length;
    test.sections[1].totalQuestions = dilrQuestions.length; 
    test.sections[2].totalQuestions = qaQuestions.length;
    test.totalQuestions = allQuestions.length;
    test.totalMarks = allQuestions.length * 3;

    await test.save();
    
    console.log(`✅ Created ${allQuestions.length} demo questions successfully!`);
    console.log(`📊 VARC: ${varcQuestions.length} questions`);
    console.log(`📊 DILR: ${dilrQuestions.length} questions`);
    console.log(`���� QA: ${qaQuestions.length} questions`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating demo questions:', error);
    process.exit(1);
  }
};

createDemoQuestions();
