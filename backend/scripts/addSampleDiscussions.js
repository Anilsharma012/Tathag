const mongoose = require('mongoose');
require('dotenv').config();

const Discussion = require('../models/Discussion');
const DiscussionReply = require('../models/DiscussionReply');
const User = require('../models/UserSchema');
const Admin = require('../models/Admin');

const sampleDiscussions = [
  {
    title: "How to solve Time and Work problems efficiently?",
    content: "I'm struggling with Time and Work problems in Quantitative Aptitude. Can someone share effective strategies or shortcuts to solve these problems quickly? I often get confused with multiple workers and different rates of work.",
    category: "quantitative-aptitude",
    tags: ["time-work", "shortcuts", "quantitative-aptitude", "CAT"],
    status: "approved",
    isPublished: true,
    views: 156,
    priority: "medium"
  },
  {
    title: "Best strategy for Reading Comprehension in CAT?",
    content: "What's the most effective approach for RC passages in CAT? Should I read the entire passage first or go straight to questions? How do you manage time efficiently while maintaining accuracy?",
    category: "verbal-ability",
    tags: ["reading-comprehension", "strategy", "CAT", "verbal"],
    status: "approved",
    isPublished: true,
    views: 234,
    priority: "high",
    isPinned: true
  },
  {
    title: "Data Interpretation shortcuts and tricks",
    content: "Looking for quick calculation methods for DI questions. Especially need help with percentage calculations, ratio comparisons, and graph interpretation. Any specific techniques that work well under time pressure?",
    category: "data-interpretation",
    tags: ["DI", "shortcuts", "calculations", "graphs"],
    status: "approved",
    isPublished: true,
    views: 189,
    priority: "medium"
  },
  {
    title: "Logical Reasoning - Statement and Assumptions",
    content: "I find Statement and Assumptions questions very tricky. How do you differentiate between valid and invalid assumptions? Are there any standard patterns or rules to follow?",
    category: "logical-reasoning",
    tags: ["logical-reasoning", "assumptions", "statements"],
    status: "pending",
    isPublished: false,
    views: 45,
    priority: "medium"
  },
  {
    title: "Current Affairs - How much is enough for competitive exams?",
    content: "What should be the scope of current affairs preparation for CAT and other MBA entrance exams? Should I focus on last 6 months or 1 year? Which sources are most reliable?",
    category: "current-affairs",
    tags: ["current-affairs", "preparation", "sources", "MBA"],
    status: "approved",
    isPublished: true,
    views: 123,
    priority: "low"
  },
  {
    title: "Permutation and Combination confusion",
    content: "I always get confused between when to use permutation vs combination. Can someone explain with simple examples? Also, how to handle complex P&C problems with restrictions?",
    category: "quantitative-aptitude",
    tags: ["permutation", "combination", "mathematics", "formulas"],
    status: "approved",
    isPublished: true,
    views: 167,
    priority: "medium"
  },
  {
    title: "Para Jumbles - Quick solving techniques",
    content: "Para jumbles take too much time for me. What are some quick techniques to identify the correct sequence? Any specific keywords or connectors to look for?",
    category: "verbal-ability",
    tags: ["para-jumbles", "verbal", "sequence", "techniques"],
    status: "approved",
    isPublished: true,
    views: 98,
    priority: "medium"
  },
  {
    title: "Mock test analysis - How to improve?",
    content: "I've been taking mock tests but my scores aren't improving. How should I analyze my performance? What's the best way to work on weak areas identified in mocks?",
    category: "general",
    tags: ["mock-tests", "analysis", "improvement", "strategy"],
    status: "pending",
    isPublished: false,
    views: 67,
    priority: "high"
  }
];

const sampleReplies = [
  {
    content: "For Time and Work problems, I use the concept of efficiency. If A can do work in 10 days, A's efficiency = 1/10 per day. For multiple workers, add their efficiencies. This approach makes calculations much easier!",
    status: "approved",
    isPublished: true,
    isBestAnswer: true
  },
  {
    content: "I always read the passage first, but quickly - just to get the gist. Then I go to questions and refer back to specific parts as needed. This saves time and improves accuracy.",
    status: "approved",
    isPublished: true
  },
  {
    content: "For DI, memorize percentage shortcuts like: 1/8 = 12.5%, 1/6 = 16.67%, 1/7 = 14.28%. Also, use estimation techniques for quick calculations.",
    status: "approved",
    isPublished: true
  },
  {
    content: "In Statement-Assumption questions, an assumption is something that must be true for the statement to hold. Look for implicit suppositions that the author takes for granted.",
    status: "pending",
    isPublished: false
  },
  {
    content: "For current affairs, focus on last 6 months for CAT. Major economic policies, business news, and international events are important. I recommend reading business newspapers daily.",
    status: "approved",
    isPublished: true
  }
];

const addSampleDiscussions = async () => {
  try {
    console.log('🚀 Starting to add sample discussions...');

    // Connect to database only if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('✅ Connected to MongoDB');
    } else {
      console.log('✅ Using existing MongoDB connection');
    }

    // Check if discussions already exist
    const existingDiscussions = await Discussion.countDocuments();
    if (existingDiscussions > 0) {
      console.log(`📚 ${existingDiscussions} discussions already exist in database`);
      console.log('🔄 Skipping sample data creation to avoid duplicates');
      return;
    }

    // Get or create sample users
    let sampleUsers = await User.find().limit(5);
    if (sampleUsers.length === 0) {
      console.log('👥 Creating sample users...');
      const users = [
        { name: 'Rahul Kumar', email: 'rahul@example.com', phoneNumber: '9876543210' },
        { name: 'Priya Sharma', email: 'priya@example.com', phoneNumber: '9876543211' },
        { name: 'Amit Singh', email: 'amit@example.com', phoneNumber: '9876543212' },
        { name: 'Sneha Patel', email: 'sneha@example.com', phoneNumber: '9876543213' },
        { name: 'Vikash Gupta', email: 'vikash@example.com', phoneNumber: '9876543214' }
      ];
      
      sampleUsers = await User.insertMany(users);
      console.log('✅ Sample users created');
    }

    // Get admin user
    let admin = await Admin.findOne();
    if (!admin) {
      console.log('👨‍💼 Creating sample admin...');
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      admin = new Admin({
        name: 'Discussion Admin',
        email: 'admin@discussions.com',
        password: hashedPassword,
        phoneNumber: '9876543200'
      });
      await admin.save();
      console.log('✅ Sample admin created');
    }

    // Create discussions
    console.log('📝 Creating sample discussions...');
    const createdDiscussions = [];
    
    for (let i = 0; i < sampleDiscussions.length; i++) {
      const discussionData = sampleDiscussions[i];
      const randomUser = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
      
      const discussion = new Discussion({
        ...discussionData,
        askedBy: randomUser._id,
        moderatedBy: discussionData.status === 'approved' ? admin._id : null,
        moderatedAt: discussionData.status === 'approved' ? new Date() : null,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date within last week
      });

      // Add some random upvotes
      const numUpvotes = Math.floor(Math.random() * 10) + 1;
      const upvoters = sampleUsers.slice(0, numUpvotes);
      discussion.upvotes = upvoters.map(user => user._id);

      await discussion.save();
      createdDiscussions.push(discussion);
    }

    console.log(`✅ Created ${createdDiscussions.length} sample discussions`);

    // Create replies for some discussions
    console.log('💬 Creating sample replies...');
    let replyCount = 0;
    
    for (let i = 0; i < Math.min(5, createdDiscussions.length); i++) {
      const discussion = createdDiscussions[i];
      const reply = sampleReplies[i];
      const randomUser = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
      
      const discussionReply = new DiscussionReply({
        ...reply,
        discussionId: discussion._id,
        repliedBy: randomUser._id,
        moderatedBy: reply.status === 'approved' ? admin._id : null,
        moderatedAt: reply.status === 'approved' ? new Date() : null,
        createdAt: new Date(discussion.createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000), // After discussion
      });

      // Add some random upvotes
      const numUpvotes = Math.floor(Math.random() * 5) + 1;
      const upvoters = sampleUsers.slice(0, numUpvotes);
      discussionReply.upvotes = upvoters.map(user => user._id);

      await discussionReply.save();
      
      // Add reply to discussion
      discussion.replies.push(discussionReply._id);
      await discussion.save();
      
      replyCount++;
    }

    console.log(`✅ Created ${replyCount} sample replies`);

    // Display summary
    const totalDiscussions = await Discussion.countDocuments();
    const totalReplies = await DiscussionReply.countDocuments();
    const pendingDiscussions = await Discussion.countDocuments({ status: 'pending' });
    const approvedDiscussions = await Discussion.countDocuments({ status: 'approved' });

    console.log('\n📊 Summary:');
    console.log(`📚 Total Discussions: ${totalDiscussions}`);
    console.log(`💬 Total Replies: ${totalReplies}`);
    console.log(`⏳ Pending Discussions: ${pendingDiscussions}`);
    console.log(`✅ Approved Discussions: ${approvedDiscussions}`);
    console.log('\n🎉 Sample discussion data added successfully!');

  } catch (error) {
    console.error('❌ Error adding sample discussions:', error);
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
  addSampleDiscussions();
}

module.exports = addSampleDiscussions;
