const express = require('express');
const router = express.Router();
const User = require('../models/UserSchema');

// Development course unlock endpoint - no auth required
router.post('/unlock-course', async (req, res) => {
  try {
    console.log('🔧 Development course unlock requested');
    
    const { courseId } = req.body;
    
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID required'
      });
    }

    // Find or create demo user with atomic upsert
    const demoEmail = 'demo@test.com';
    let demoUser = await User.findOneAndUpdate(
      { email: demoEmail },
      {
        $setOnInsert: {
          email: demoEmail,
          phoneNumber: '9999999999',
          name: 'Demo Student',
          isEmailVerified: true,
          isPhoneVerified: true,
          city: 'Demo City',
          gender: 'Male',
          dob: new Date('1995-01-01'),
          selectedCategory: 'CAT',
          selectedExam: 'CAT 2025',
          enrolledCourses: []
        }
      },
      { upsert: true, new: true }
    );
    console.log('✅ Demo user ready:', demoUser._id);

    // Check if course is already unlocked
    const existingCourse = demoUser.enrolledCourses.find(
      c => c.courseId && c.courseId.toString() === courseId
    );
    
    if (existingCourse) {
      return res.status(200).json({
        success: true,
        message: 'Course already unlocked',
        alreadyUnlocked: true
      });
    }

    // Add course to enrolled courses
    demoUser.enrolledCourses.push({
      courseId,
      status: 'unlocked',
      enrolledAt: new Date()
    });
    
    await demoUser.save();
    console.log('✅ Course unlocked for demo user:', courseId);

    res.status(200).json({
      success: true,
      message: 'Course unlocked successfully',
      courseId,
      userId: demoUser._id
    });

  } catch (error) {
    console.error('❌ Dev course unlock error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
