const mongoose = require('mongoose');
const StudyMaterial = require('../models/StudyMaterial');
const Admin = require('../models/Admin');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Sample study materials data
const sampleMaterials = [
  {
    title: 'Quantitative Aptitude Formula Book',
    description: 'Complete formula book covering all topics of Quantitative Aptitude including Arithmetic, Algebra, Geometry, and Number Systems.',
    subject: 'Quantitative Aptitude',
    type: 'PDF',
    fileName: 'QA_Formula_Book.pdf',
    filePath: 'uploads/study-materials/sample-qa-formulas.pdf',
    fileSize: '5.2 MB',
    tags: ['formulas', 'QA', 'reference', 'mathematics'],
    downloadCount: 1234
  },
  {
    title: 'Verbal Ability Video Lectures Series',
    description: 'Comprehensive video lecture series covering Reading Comprehension, Para Jumbles, Critical Reasoning, and Grammar.',
    subject: 'Verbal Ability',
    type: 'Video',
    fileName: 'VA_Video_Lectures.mp4',
    filePath: 'uploads/study-materials/sample-va-videos.mp4',
    fileSize: '850 MB',
    tags: ['video', 'verbal', 'lectures', 'comprehension'],
    downloadCount: 856
  },
  {
    title: 'Data Interpretation Practice Sets',
    description: 'Collection of 50 practice sets for Data Interpretation covering Tables, Charts, Graphs, and Caselets.',
    subject: 'Data Interpretation',
    type: 'Practice Sets',
    fileName: 'DI_Practice_Sets.pdf',
    filePath: 'uploads/study-materials/sample-di-practice.pdf',
    fileSize: '3.8 MB',
    tags: ['practice', 'DI', 'charts', 'graphs'],
    downloadCount: 945
  },
  {
    title: 'Logical Reasoning Shortcuts & Tricks',
    description: 'Quick shortcuts and time-saving tricks for solving Logical Reasoning questions efficiently.',
    subject: 'Logical Reasoning',
    type: 'Notes',
    fileName: 'LR_Shortcuts.pdf',
    filePath: 'uploads/study-materials/sample-lr-shortcuts.pdf',
    fileSize: '2.1 MB',
    tags: ['shortcuts', 'tricks', 'logical reasoning', 'time-saving'],
    downloadCount: 672
  },
  {
    title: 'CAT Previous Year Papers (2010-2023)',
    description: 'Complete collection of CAT previous year question papers with detailed solutions and explanations.',
    subject: 'All Subjects',
    type: 'PDF',
    fileName: 'CAT_Previous_Papers.pdf',
    filePath: 'uploads/study-materials/sample-cat-papers.pdf',
    fileSize: '12.5 MB',
    tags: ['previous papers', 'CAT', 'solutions', 'practice'],
    downloadCount: 2156
  },
  {
    title: 'Reading Comprehension Passages',
    description: 'Collection of high-quality Reading Comprehension passages from various topics with detailed explanations.',
    subject: 'Verbal Ability',
    type: 'PDF',
    fileName: 'RC_Passages.pdf',
    filePath: 'uploads/study-materials/sample-rc-passages.pdf',
    fileSize: '7.3 MB',
    tags: ['reading comprehension', 'passages', 'verbal', 'practice'],
    downloadCount: 789
  },
  {
    title: 'Quantitative Aptitude Video Solutions',
    description: 'Video solutions for complex QA problems with step-by-step explanations and alternative methods.',
    subject: 'Quantitative Aptitude',
    type: 'Video',
    fileName: 'QA_Video_Solutions.mp4',
    filePath: 'uploads/study-materials/sample-qa-solutions.mp4',
    fileSize: '1.2 GB',
    tags: ['video solutions', 'QA', 'problem solving', 'mathematics'],
    downloadCount: 543
  },
  {
    title: 'General Knowledge Current Affairs',
    description: 'Latest current affairs and general knowledge updates for competitive exam preparation.',
    subject: 'General Knowledge',
    type: 'PDF',
    fileName: 'GK_Current_Affairs.pdf',
    filePath: 'uploads/study-materials/sample-gk-current.pdf',
    fileSize: '4.6 MB',
    tags: ['current affairs', 'GK', 'general knowledge', 'updates'],
    downloadCount: 421
  }
];

// Add sample study materials
const addSampleMaterials = async () => {
  try {
    // First, get or create an admin user
    let admin = await Admin.findOne();
    
    if (!admin) {
      // Create a sample admin if none exists
      admin = new Admin({
        name: 'Sample Admin',
        email: 'admin@sample.com',
        password: 'hashedpassword', // This should be properly hashed
        phoneNumber: '1234567890'
      });
      await admin.save();
      console.log('✅ Sample admin created');
    }

    // Clear existing materials to avoid duplicates
    await StudyMaterial.deleteMany({});
    console.log('🗑️ Cleared existing study materials');

    // Add uploadedBy field to each material
    const materialsWithAdmin = sampleMaterials.map(material => ({
      ...material,
      uploadedBy: admin._id,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    // Insert all materials
    const insertedMaterials = await StudyMaterial.insertMany(materialsWithAdmin);
    
    console.log(`✅ Successfully added ${insertedMaterials.length} study materials:`);
    insertedMaterials.forEach((material, index) => {
      console.log(`${index + 1}. ${material.title} (${material.subject} - ${material.type})`);
    });

    // Display summary
    const totalMaterials = await StudyMaterial.countDocuments();
    console.log(`\n📊 Total study materials in database: ${totalMaterials}`);
    
    // Group by subject
    const bySubject = await StudyMaterial.aggregate([
      { $group: { _id: '$subject', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\n📚 Materials by subject:');
    bySubject.forEach(subject => {
      console.log(`- ${subject._id}: ${subject.count} materials`);
    });

  } catch (error) {
    console.error('❌ Error adding sample materials:', error);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await addSampleMaterials();
  
  console.log('\n🎉 Sample study materials added successfully!');
  console.log('You can now view them in the admin panel and student dashboard.');
  
  process.exit(0);
};

// Run the script
main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
