const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const path = require("path");
const multer = require("multer");
const { optionalAuth } = require("./middleware/authMiddleware");


dotenv.config();

// Debug environment variables
console.log('🔍 Environment Debug:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGO_URI exists:', !!process.env.MONGO_URI);
console.log('MONGO_URI length:', process.env.MONGO_URI ? process.env.MONGO_URI.length : 0);

const Connection = require("./dbConnection");
Connection();

const app = express();

// ======================= Trust Proxy for Cloud Deployment ===============
app.set('trust proxy', 1); // Trust first proxy for cloud platforms like Fly.dev

// ======================= Security Middleware ============================
app.use(helmet()); // secure headers
app.use(xss()); // prevent XSS attacks
app.use(mongoSanitize()); // prevent Mongo injection
app.use(express.json({ limit: "10mb" }));
 // limit request payload

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 3000 : 1000000, // generous in prod, effectively off in dev/preview
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req, _res) => {
      // Prefer user id if authenticated to avoid shared IP collisions behind proxies
      return (req.user && req.user.id) || req.ip;
    },
    skip: (req, _res) => {
      // Disable on non-production and for health/static
      if (process.env.NODE_ENV !== 'production') return true;
      const url = req.originalUrl || req.path || '';
      if (url.startsWith('/api/health') || url.startsWith('/api/test')) return true;
      // Allow public GETs for live classes listing to avoid shared IP spikes
      if (req.method === 'GET' && (url.startsWith('/api/live-classes') || url.includes('/live-classes'))) return true;
      if (req.method === 'GET' && (url.startsWith('/api/courses/student/published-courses'))) return true;
      if (req.method === 'GET' && (url === '/api/courses' || url.startsWith('/api/courses?'))) return true;
      return false;
    },
    message: "Too many requests from this client, please try again after 15 minutes."
});
// Scope limiter to API routes only, attach optionalAuth before to key by user
app.use('/api', optionalAuth, limiter);

// ======================= Payload Config ================================
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

// ======================= CORS ==========================================
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",              // Added for current dev setup
   "http://127.0.0.1:3000",              // Local dev
  "https://tathagat.satyaka.in",            // Production domain
  "https://602013ebf633402e8096c9cab19561d7-38235a13d63b4a5991fa93f6f.fly.dev",  // Previous deployment
  "https://56e17d465c834696b5b3654be57883bc-f85b5f4c5dc640488369d7da4.fly.dev"  // Current frontend deployment
];

app.use(cors({
  origin: true, // Allow all origins for development
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));


// ======================= Logger ========================================
app.use("/uploads", (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // 👈 for testing, use * (later tighten to 3000 only)
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin"); // ✅ THIS fixes image preview!
  next();
});




app.use("/uploads", express.static(path.join(__dirname, "uploads")));




// ======================= Health Check ========================================
app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        message: "Backend server is running",
        timestamp: new Date().toISOString()
    });
});

// ======================= Test Endpoint ========================================
app.get("/api/test", (req, res) => {
    res.status(200).json({
        success: true,
        message: "API is working in production",
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

// ======================= Development Test User ========================================
app.post("/api/dev/login", async (req, res) => {
    try {
        const jwt = require('jsonwebtoken');
        const User = require('./models/UserSchema');

        console.log('��� Development login request received');

        // Find or create a real demo user with atomic upsert
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
        console.log('✅ Demo user ready in database with ID:', demoUser._id);

        const jwtSecret = process.env.JWT_SECRET || 'test_secret_key_for_development';
        const token = jwt.sign(
            { id: demoUser._id, role: 'student' },
            jwtSecret,
            { expiresIn: '24h' }
        );

        console.log('✅ Development token created for real user:', demoUser._id);

        res.status(200).json({
            success: true,
            message: "Development user logged in",
            token: token,
            user: {
                id: demoUser._id,
                email: demoUser.email,
                name: demoUser.name,
                role: 'student'
            }
        });
    } catch (error) {
        console.error('❌ Dev login error:', error);
        res.status(500).json({
            success: false,
            message: "Development login failed",
            error: error.message
        });
    }
});

// ======================= Development Course Unlock ========================================
app.post("/api/dev/unlock-course", async (req, res) => {
    try {
        console.log('🔧 Development course unlock requested');

        const { courseId } = req.body;

        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: 'Course ID required'
            });
        }

        const User = require('./models/UserSchema');

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

// ======================= Debug Token Validation ========================================
app.get("/api/dev/verify-token", (req, res) => {
    const jwt = require('jsonwebtoken');

    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(400).json({
                success: false,
                message: "No token provided"
            });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test_secret_key_for_development');

        console.log('✅ Token verified for user:', decoded);

        res.status(200).json({
            success: true,
            message: "Token is valid",
            user: decoded
        });
    } catch (error) {
        console.error('❌ Token verification failed:', error.message);
        res.status(401).json({
            success: false,
            message: "Invalid token",
            error: error.message
        });
    }
});

// ======================= Add Sample Data on Startup ========================================
const addSampleStudyMaterials = async () => {
    try {
        const StudyMaterial = require('./models/StudyMaterial');
        const Admin = require('./models/Admin');

        // Check if materials already exist
        const existingCount = await StudyMaterial.countDocuments();
        if (existingCount > 0) {
            console.log(`📚 ${existingCount} study materials already exist in database`);
            return;
        }

        // Get first admin user
        let admin = await Admin.findOne();

        if (!admin) {
            // Create a sample admin if none exists
            const bcrypt = require('bcrypt');
            const hashedPassword = await bcrypt.hash('admin123', 10);

            admin = new Admin({
                name: 'Sample Admin',
                email: 'admin@sample.com',
                password: hashedPassword,
                phoneNumber: '1234567890'
            });
            await admin.save();
            console.log('✅ Sample admin created');
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

        // Insert all materials
        const insertedMaterials = await StudyMaterial.insertMany(sampleMaterials);

        console.log(`✅ Successfully added ${insertedMaterials.length} study materials:`);
        insertedMaterials.forEach((material, index) => {
            console.log(`${index + 1}. ${material.title} (${material.subject} - ${material.type})`);
        });

        // Display summary
        const totalMaterials = await StudyMaterial.countDocuments();
        console.log(`\n📊 Total study materials in database: ${totalMaterials}`);

    } catch (error) {
        console.error('❌ Error adding sample materials:', error);
    }
};

// ======================= Add Sample Announcements ========================================
const addSampleAnnouncements = async () => {
    try {
        const Announcement = require('./models/Announcement');
        const Admin = require('./models/Admin');

        // Check if announcements already exist
        const existingCount = await Announcement.countDocuments();
        if (existingCount > 0) {
            console.log(`📢 ${existingCount} announcements already exist in database`);
            return;
        }

        // Get first admin user
        let admin = await Admin.findOne();

        if (!admin) {
            console.log('⚠️ No admin found for announcements');
            return;
        }

        // Sample announcements data
        const sampleAnnouncements = [
            {
                title: '🎉 New Mock Test Series Released!',
                content: 'We have launched the latest CAT 2024 mock test series with updated patterns and difficulty levels. These tests are designed to simulate the actual exam environment.',
                type: 'important',
                priority: 'high',
                targetAudience: 'students',
                isPinned: true,
                createdBy: admin._id,
                tags: ['mock tests', 'CAT 2024', 'new release'],
                isActive: true
            },
            {
                title: '📚 Study Materials Updated',
                content: 'Quantitative Aptitude formulas and shortcuts have been updated with new content covering advanced topics and time-saving techniques.',
                type: 'update',
                priority: 'medium',
                targetAudience: 'students',
                isPinned: false,
                createdBy: admin._id,
                tags: ['study materials', 'quantitative aptitude', 'update'],
                isActive: true
            },
            {
                title: '🔔 Upcoming Live Session',
                content: 'Join us for a special doubt clearing session on Data Interpretation this Friday at 7 PM. Our expert faculty will solve complex DI problems.',
                type: 'reminder',
                priority: 'medium',
                targetAudience: 'students',
                isPinned: false,
                createdBy: admin._id,
                tags: ['live session', 'data interpretation', 'doubt clearing'],
                expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expires in 7 days
                isActive: true
            },
            {
                title: '�� Performance Reports Available',
                content: 'Your monthly performance report is now available in the Analysis section. Check your progress and identify areas for improvement.',
                type: 'update',
                priority: 'low',
                targetAudience: 'students',
                isPinned: false,
                createdBy: admin._id,
                tags: ['performance report', 'analysis', 'progress'],
                isActive: true
            },
            {
                title: '💡 New Feature: AI-Powered Question Recommendations',
                content: 'We have introduced an AI-powered recommendation system that suggests practice questions based on your weak areas and learning patterns.',
                type: 'general',
                priority: 'medium',
                targetAudience: 'all',
                isPinned: false,
                createdBy: admin._id,
                tags: ['AI', 'recommendations', 'personalized learning'],
                isActive: true
            },
            {
                title: '🔧 Scheduled Maintenance',
                content: 'The platform will undergo scheduled maintenance on Sunday from 2 AM to 4 AM IST. Some features may be temporarily unavailable.',
                type: 'maintenance',
                priority: 'high',
                targetAudience: 'all',
                isPinned: false,
                createdBy: admin._id,
                tags: ['maintenance', 'downtime', 'schedule'],
                expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Expires in 3 days
                isActive: true
            }
        ];

        // Insert all announcements
        const insertedAnnouncements = await Announcement.insertMany(sampleAnnouncements);

        console.log(`✅ Successfully added ${insertedAnnouncements.length} sample announcements:`);
        insertedAnnouncements.forEach((announcement, index) => {
            console.log(`${index + 1}. ${announcement.title} (${announcement.type} - ${announcement.priority})`);
        });

        // Display summary
        const totalAnnouncements = await Announcement.countDocuments();
        console.log(`\n��� Total announcements in database: ${totalAnnouncements}`);

    } catch (error) {
        console.error('❌ Error adding sample announcements:', error);
    }
};

// Call the function after DB connection
setTimeout(() => {
    addSampleStudyMaterials();
    addSampleAnnouncements();

    // Add sample discussions
    const addSampleDiscussions = require('./scripts/addSampleDiscussions');
    addSampleDiscussions();

    // Add sample mock tests
    const addSampleMockTests = require('./scripts/addSampleMockTests');
    addSampleMockTests();

    // Create demo data for CAT exams
    const { createDemoData } = require('./controllers/DemoController');
    setTimeout(() => {
        createDemoData({}, {
            json: (data) => console.log('Demo data result:', data.message)
        });
    }, 5000);
}, 3000);

// Restart trigger - updated 2

// ======================= Development Mock Data ========================================
// if (process.env.NODE_ENV !== 'production') {
//     // Removed duplicate route - using real controller from CourseRoute.js

//     app.get("/api/user/student/my-courses", (req, res) => {
//         res.status(200).json({
//             success: true,
//             courses: []
//         });
//     });

//     app.get("/api/v1/auto-login", (req, res) => {
//         res.status(200).json({
//             exists: false,
//             message: "Auto-login disabled in development mode"
//         });
//     });
// }

// ======================= Request Logging for Debugging ========================================
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);

  // Capture the original send method
  const originalSend = res.send;
  res.send = function(data) {
    // Log 400 and 500 responses
    if (res.statusCode >= 400) {
      console.log(`⚠️ ${res.statusCode} Response - ${req.method} ${req.path} - ${data}`);
    }
    return originalSend.call(this, data);
  };

  next();
});

// ======================= Development Payment Endpoints ========================================
app.post("/api/dev-payment/unlock-course-payment", async (req, res) => {
    try {
        console.log('🔧 Development payment unlock requested');

        const { courseId } = req.body;

        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: 'Course ID required'
            });
        }

        const User = require('./models/UserSchema');

        // Find or create demo user with fixed ID (atomic operation to prevent race conditions)
        const demoUserId = '507f1f77bcf86cd799439011';
        const demoEmail = 'demo@test.com';

        let demoUser = await User.findOneAndUpdate(
            { email: demoEmail },
            {
                $setOnInsert: {
                    _id: demoUserId,
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
                alreadyUnlocked: true,
                enrolledCourses: demoUser.enrolledCourses
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
            userId: demoUser._id,
            enrolledCourses: demoUser.enrolledCourses
        });

    } catch (error) {
        console.error('❌ Dev payment unlock error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

app.get("/api/dev-payment/my-courses", async (req, res) => {
    try {
        console.log('🔧 Development my-courses requested');

        const User = require('./models/UserSchema');

        // First try to find demo user by email (consistent with other endpoints)
        const demoEmail = 'demo@test.com';
        let demoUser = await User.findOne({ email: demoEmail }).populate('enrolledCourses.courseId');

        // If not found, try by hardcoded ID as fallback
        if (!demoUser) {
            const demoUserId = '507f1f77bcf86cd799439011';
            demoUser = await User.findById(demoUserId).populate('enrolledCourses.courseId');
        }

        console.log('👤 Demo user found:', demoUser ? demoUser._id : 'NOT FOUND');

        if (!demoUser) {
            console.log('⚠️ No demo user found, returning empty courses');
            return res.status(200).json({
                success: true,
                courses: []
            });
        }

        console.log('📚 Demo user enrolled courses:', demoUser.enrolledCourses);
        console.log('📊 Total enrolled courses count:', demoUser.enrolledCourses.length);

        const unlockedCourses = demoUser.enrolledCourses
            .filter(c => {
                console.log('🔍 Dev endpoint checking course:', c);
                console.log('   - Status:', c.status);
                console.log('   - CourseId:', c.courseId);
                return c.status === "unlocked" && c.courseId;
            })
            .map(c => ({
                _id: c._id,
                status: c.status,
                enrolledAt: c.enrolledAt,
                courseId: c.courseId,
            }));

        console.log('🎯 Dev endpoint filtered unlocked courses:', unlockedCourses);
        console.log('📊 Dev endpoint returning courses count:', unlockedCourses.length);

        res.status(200).json({
            success: true,
            courses: unlockedCourses
        });

    } catch (error) {
        console.error('❌ Dev my-courses error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// ======================= Routes ========================================
const authEmailRoutes = require("./routes/authEmailRoutes");
const authPhoneRoutes = require("./routes/authPhoneRoutes");
const userRoutes = require("./routes/userRoutes");
const OTP = require("./routes/Otp");
const IIMPredictor = require("./routes/IIMPredictor");
const ResponseSheet = require("./routes/ResponseSheet");

const blogRoutes = require("./routes/blogRoutes");
 const adminRoute = require("./routes/AdminRoute");
const subAdminRoute = require("./routes/SubAdminRoute");
const courseRoutes = require("./routes/CourseRoute");
const subjectRoutes = require("./routes/SubjectRoute");
const chapterRoute = require("./routes/ChapterRoute");
const topicRoutes = require("./routes/TopicRoute");
const testRoutes = require("./routes/TestRoute");
const questionRoutes = require("./routes/QuestionRoute");
const responseRoutes = require("./routes/ResponseRoute");
const uploadRoute = require("./routes/UploadRoute");
const bulkUploadRoute = require("./routes/bulkUpload");
const zoomRoute = require("./routes/zoom");
const discussionRoutes = require("./routes/DiscussionRoute");
const adminDiscussionRoutes = require("./routes/AdminDiscussionRoute");
const mockTestRoutes = require("./routes/MockTestRoute");
const adminMockTestRoutes = require("./routes/AdminMockTestRoute");
const practiceTestRoutes = require("./routes/practiceTestRoutes");

app.use("/api/auth/email", authEmailRoutes);
app.use("/api/auth/phone", authPhoneRoutes);
app.use("/api/user", userRoutes);
app.use("/api/v1", OTP);
app.use("/api/v2", IIMPredictor);
app.use("/api/v3", ResponseSheet);
 app.use("/api/admin", adminRoute);
app.use("/api/admin/bulk-upload", bulkUploadRoute);
app.use("/api/admin/zoom", zoomRoute);

app.use("/api/v5", blogRoutes);

app.use("/api/subadmin", subAdminRoute);
app.use("/api/courses", courseRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/chapters", chapterRoute);
app.use("/api/topics", topicRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api", require("./routes/locks"));
app.use("/api", require("./routes/batchesQuery"));
app.use("/api/responses", responseRoutes);
app.use("/api/upload", uploadRoute);
app.use("/api/study-materials", require("./routes/StudyMaterialRoute"));
app.use("/api/announcements", require("./routes/AnnouncementRoute"));
app.use("/api/discussions", discussionRoutes);
app.use("/api/admin/discussions", adminDiscussionRoutes);
app.use("/api/mock-tests", mockTestRoutes);
    app.use("/api/admin/mock-tests", adminMockTestRoutes);
    app.use("/api/progress", require("./routes/UserProgressRoute"));
    app.use("/api/student", require("./routes/StudentCourseRoute"));
    app.use("/api/sample", require("./routes/sampleData"));
    app.use("/api/demo", require("./routes/demoRoutes"));
    app.use("/api/user", require("./routes/userRoutes"));
    app.use("/api/test", require("./routes/testAuth"));
    app.use("/api/dev", require("./routes/devRoutes"));
    app.use("/api/dev-payment", require("./routes/devPayment"));
    app.use("/api/test-endpoint", require("./routes/testEndpoint"));
    app.use("/api/crm", require("./routes/crm"));
    app.use("/api/live-classes", require("./routes/liveClasses"));
    app.use("/api/ocr", require("./routes/ocr"));
    app.use("/api/omr", require("./routes/omr"));
    app.use("/api", require("./routes/reports"));
    app.use("/api/payments", require("./routes/payments"));
    app.use("/api/practice-tests", practiceTestRoutes);
    app.use("/api", require("./routes/nextStep"));
    app.use("/api/admin", require("./routes/batchesAdmin"));
    app.use("/api/admin/academics", require("./routes/adminAcademics"));
    app.use("/api", require("./routes/lessons"));

// ======================= Global Error Handler ==========================
app.use((err, req, res, next) => {
    console.error("❌ Global Error:", err.message);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
    })
});

// Removed duplicate static serving - handled in production block below

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({ storage });

app.post("/api/upload", upload.single("file"), (req, res) => {
  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.status(200).json({ success: true, url: fileUrl });
});

// 👇 Production static file serving - Temporarily disabled for debugging
// The build directory doesn't exist, so let's focus on getting API working first
if (process.env.NODE_ENV === "production") {
  console.log("🚀 Production mode detected, but build directory not found");
  console.log("📁 Looking for build directory at:", path.join(__dirname, "../Frontend/build"));

  // Only serve API routes for now
  app.get("/", (req, res) => {
    res.json({
      message: "Backend API is running",
      health: "/api/health",
      test: "/api/test",
      courses: "/api/courses/student/published-courses"
    });
  });
}



// ======================= Server Start ==========================
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Server accessible at http://0.0.0.0:${PORT}`);
    console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✅ JWT Secret loaded: ${!!process.env.JWT_SECRET}`);
});

server.on('error', (error) => {
    console.error('❌ Server startup error:', error);
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
    }
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});
