const Course = require("../models/course/Course");

// ✅ Create new course
const createCourse = async (req, res) => {
  try {
    console.log("📥 Received course creation request");

    const { name, description, price } = req.body;
    const thumbnail = req.file ? req.file.filename : "";

    console.log("✅ req.body:", req.body);
    console.log("✅ req.file:", req.file);

    // Check for required fields
    if (!name || !description || !price || !thumbnail) {
      console.warn("⚠️ Missing required fields");
      return res.status(400).json({
        success: false,
        message: "All fields (name, description, price, thumbnail) are required.",
      });
    }

    // Check for duplicate
    const existing = await Course.findOne({ name });
    if (existing) {
      console.warn("⚠️ Course with same name already exists:", name);
      return res.status(400).json({ success: false, message: "Course already exists" });
    }

    const course = new Course({
      name,
      description,
      price,
      thumbnail,
      createdBy: req.user.id,
    });

    await course.save();
    console.log("✅ Course saved to DB:", course);

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      course,
    });
  } catch (err) {
    console.error("❌ Error creating course:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error. Failed to create course.",
      error: err.message,
    });
  }
};


// ✅ Get all courses
const getCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, courses });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Get course by ID
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    res.status(200).json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Update course with image handling
const updateCourse = async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const updateData = { name, description, price };

    if (req.file) {
      updateData.thumbnail = req.file.filename;
    }

    const updated = await Course.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      course: updated,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Update failed" });
  }
};

// ✅ Delete course
const deleteCourse = async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Course deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Delete failed" });
  }
};

// ✅ Lock/Unlock course
const toggleLock = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    course.locked = !course.locked;
    await course.save();

    res.status(200).json({
      success: true,
      message: `Course ${course.locked ? "locked" : "unlocked"}`,
      course,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Toggle failed" });
  }
};

// ✅ Publish/Unpublish course
const togglePublish = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    course.published = !course.published;
    await course.save();

    res.status(200).json({
      success: true,
      message: `Course ${course.published ? "published" : "unpublished"} successfully`,
      course,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Publish toggle failed" });
  }
};

// ✅ Get all published courses for students
const getPublishedCourses = async (req, res) => {
  console.log('📚 getPublishedCourses called');
  try {
    // In development mode, provide fallback if database is not connected
    if (process.env.NODE_ENV === 'development') {
      try {
        console.log('🔍 Searching for published courses in database...');

        // First check all courses
        const allCourses = await Course.find({}).sort({ createdAt: -1 });
        console.log('📊 Total courses in database:', allCourses.length);
        console.log('📋 All courses:', allCourses.map(c => ({ name: c.name, published: c.published, locked: c.locked })));

        // Then get only published courses
        const courses = await Course.find({ published: true }).sort({ createdAt: -1 });
        console.log('✅ Published courses found:', courses.length);
        console.log('📋 Published courses:', courses.map(c => ({ name: c.name, published: c.published })));

        res.status(200).json({ success: true, courses });
      } catch (dbError) {
        console.log('⚠️ Database not available, using mock data', dbError.message);
        // Fallback to mock data if database is not connected
        const mockCourses = [
          {
            _id: "dev_mock_1",
            name: "CAT Complete Course 2024",
            description: "Complete CAT preparation course with all subjects covered",
            price: 15999,
            thumbnail: "cat-course.jpg",
            published: true,
            createdAt: new Date()
          },
          {
            _id: "dev_mock_2",
            name: "XAT Preparation Course",
            description: "Comprehensive XAT preparation with mock tests and study materials",
            price: 12999,
            thumbnail: "xat-course.jpg",
            published: true,
            createdAt: new Date()
          },
          {
            _id: "dev_mock_3",
            name: "NMAT Crash Course",
            description: "Intensive NMAT preparation course for quick results",
            price: 8999,
            thumbnail: "nmat-course.jpg",
            published: true,
            createdAt: new Date()
          }
        ];
        res.status(200).json({ success: true, courses: mockCourses });
      }
    } else {
      const courses = await Course.find({ published: true }).sort({ createdAt: -1 });
      res.status(200).json({ success: true, courses });
    }
  } catch (err) {
    console.error('❌ Error in getPublishedCourses:', err);
    res.status(500).json({ success: false, message: "Failed to fetch published courses" });
  }
};

const getPublishedCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course || !course.published) {
      return res.status(403).json({ message: "Course not published or not found" });
    }

    res.status(200).json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};



module.exports = {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  toggleLock,
  togglePublish,
  getPublishedCourses,
  getPublishedCourseById
};
