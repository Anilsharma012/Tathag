const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/UserSchema');

// Test student login for development
router.post('/student-login', async (req, res) => {
  try {
    console.log('🔍 Test student login requested');
    
    // Create or find test student
    let testStudent = await User.findOne({ email: 'student@test.com' });
    
    if (!testStudent) {
      testStudent = new User({
        email: 'student@test.com',
        phone: '9999999999',
        name: 'Test Student',
        city: 'Test City',
        gender: 'Male',
        dob: new Date('1995-01-01'),
        selectedCategory: 'CAT',
        selectedExam: 'CAT 2025',
        enrolledCourses: []
      });
      await testStudent.save();
      console.log('✅ Test student created');
    }

    const token = jwt.sign(
      { id: testStudent._id, role: 'student' },
      process.env.JWT_SECRET || 'test_secret_key_for_development',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: testStudent._id,
        name: testStudent.name,
        email: testStudent.email,
        phone: testStudent.phone
      },
      message: 'Test student login successful'
    });

  } catch (error) {
    console.error('❌ Test student login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
});

module.exports = router;
